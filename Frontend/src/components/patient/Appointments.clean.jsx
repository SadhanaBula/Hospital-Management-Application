import React, { useState, useEffect, useMemo } from 'react';
import { 
  UserIcon, 
  ExclamationCircleIcon, 
  ClockIcon, 
  CalendarIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { appointmentService } from '../../services/api';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelingId, setCancelingId] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [sortBy, setSortBy] = useState('date');
  const [filterStatus, setFilterStatus] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async (isRefreshing = false) => {
    if (!isRefreshing) {
      setLoading(true);
    }
    setRefreshing(true);
    setError(null);
    
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        setError('You must be logged in to view appointments');
        return;
      }

      const user = JSON.parse(userData);
      const patientId = user.id || user.P_ID || user.patientId;
      
      if (!patientId) {
        setError('Unable to determine patient ID');
        return;
      }

      const response = await appointmentService.getAppointmentsByPatient(patientId);
      
      let appointmentsData = [];
      if (Array.isArray(response)) {
        appointmentsData = response;
      } else if (response?.data) {
        appointmentsData = Array.isArray(response.data) ? response.data : [response.data];
      }
      
      setAppointments(appointmentsData);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('Failed to load appointments. Please try again.');
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!appointmentId) return;
    
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      setCancelingId(appointmentId);
      await appointmentService.cancelAppointment(appointmentId);
      toast.success('Appointment cancelled successfully');
      fetchAppointments();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel appointment');
    } finally {
      setCancelingId(null);
    }
  };

  const isUpcoming = (date, time) => {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    const appointmentDate = new Date(date);
    appointmentDate.setHours(hours, minutes, 0, 0);
    return appointmentDate > now;
  };

  const filteredAppointments = useMemo(() => {
    let result = [...appointments];
    
    // Filter by status
    if (filterStatus !== 'all') {
      result = result.filter(appt => appt.status === filterStatus);
    }
    
    // Filter by tab (upcoming/past)
    if (activeTab === 'upcoming') {
      result = result.filter(appt => isUpcoming(appt.appointment_date, appt.appointment_time));
    } else if (activeTab === 'past') {
      result = result.filter(appt => !isUpcoming(appt.appointment_date, appt.appointment_time));
    }
    
    // Sort by selected criteria
    result.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(a.appointment_date) - new Date(b.appointment_date);
      } else if (sortBy === 'doctor') {
        return (a.doctor?.name || '').localeCompare(b.doctor?.name || '');
      } else {
        return (a.status || '').localeCompare(b.status || '');
      }
    });
    
    return result;
  }, [appointments, filterStatus, activeTab, sortBy]);

  const getStatusClass = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircleIcon className="h-4 w-4 mr-1" />;
      case 'PENDING':
        return <ClockIcon className="h-4 w-4 mr-1" />;
      case 'CANCELLED':
        return <XCircleIcon className="h-4 w-4 mr-1" />;
      default:
        return <ExclamationCircleIcon className="h-4 w-4 mr-1" />;
    }
  };

  if (loading && !refreshing) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
                <button
                  onClick={() => fetchAppointments(true)}
                  disabled={refreshing}
                  className={`ml-3 p-1.5 rounded-full ${refreshing ? 'text-gray-400' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                  title="Refresh appointments"
                >
                  <ArrowPathIcon className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <div className="flex rounded-md shadow-sm">
                  <button
                    type="button"
                    onClick={() => setActiveTab('upcoming')}
                    className={`px-4 py-2 text-sm font-medium rounded-l-md ${activeTab === 'upcoming' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    Upcoming
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('past')}
                    className={`px-4 py-2 text-sm font-medium rounded-r-md ${activeTab === 'past' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    Past
                  </button>
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
                >
                  <option value="date">Sort by Date</option>
                  <option value="doctor">Sort by Doctor</option>
                  <option value="status">Sort by Status</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
                >
                  <option value="all">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {refreshing && (
              <div className="flex justify-center mb-4">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
              </div>
            )}

            {filteredAppointments.length === 0 ? (
              <div className="text-center py-12">
                <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {activeTab === 'upcoming' 
                    ? "You don't have any upcoming appointments."
                    : "You don't have any past appointments."}
                </p>
                <div className="mt-6">
                  <Link
                    to="/book-appointment"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Book Appointment
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAppointments.map((appointment) => (
                  <div 
                    key={appointment.id || `${appointment.appointment_date}-${appointment.appointment_time}`}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            {appointment.doctor?.image ? (
                              <img
                                className="h-16 w-16 rounded-full object-cover"
                                src={appointment.doctor.image}
                                alt={appointment.doctor.name}
                              />
                            ) : (
                              <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                                <UserIcon className="h-8 w-8 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              {appointment.doctor?.name || 'Doctor Name Not Available'}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {appointment.doctor?.specialty || 'Specialty Not Available'}
                            </p>
                            <div className="mt-1 flex items-center text-sm text-gray-500">
                              <CalendarIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                              {new Date(appointment.appointment_date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                              <span className="mx-1">•</span>
                              <ClockIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                              {appointment.appointment_time}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 md:mt-0 flex items-center space-x-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(appointment.status)}`}>
                            {getStatusIcon(appointment.status)}
                            {appointment.status || 'UNKNOWN'}
                          </span>
                          
                          {appointment.status === 'PENDING' && (
                            <button
                              onClick={() => handleCancelAppointment(appointment.id)}
                              disabled={cancelingId === appointment.id}
                              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                            >
                              {cancelingId === appointment.id ? 'Canceling...' : 'Cancel'}
                            </button>
                          )}
                          
                          <Link
                            to={`/appointments/${appointment.id}`}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                      
                      {appointment.Descript && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Reason for Visit:</h4>
                          <p className="text-sm text-gray-600">{appointment.Descript}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Need to cancel or reschedule?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Please contact our support team if you need assistance with your appointment.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="tel:+1234567890"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Call Support
                </a>
                <a
                  href="mailto:support@example.com"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Email Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appointments;
