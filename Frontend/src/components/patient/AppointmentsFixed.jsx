import React, { useState, useEffect } from 'react';
import { 
  UserIcon, 
  ExclamationCircleIcon, 
  ClockIcon, 
  CalendarIcon, 
  CheckCircleIcon, 
  XCircleIcon 
} from '@heroicons/react/24/outline';
import { appointmentService } from '../../services/api';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const AppointmentsFixed = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelingId, setCancelingId] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [filterStatus, setFilterStatus] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  // Format date to a readable string
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  // Format time to 12-hour format
  const formatTime = (timeString) => {
    if (!timeString) return 'Time not specified';
    
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Check if appointment is upcoming
  const isUpcoming = (dateString, timeString) => {
    if (!dateString) return false;
    
    const appointmentDate = new Date(dateString);
    if (timeString) {
      const [hours, minutes] = timeString.split(':');
      appointmentDate.setHours(parseInt(hours, 10));
      appointmentDate.setMinutes(parseInt(minutes, 10));
    }
    
    return appointmentDate > new Date();
  };

  // Get status styling
  const getStatusClass = (status) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
        return <CheckCircleIcon className="h-4 w-4 mr-1" />;
      case 'CANCELLED':
        return <XCircleIcon className="h-4 w-4 mr-1" />;
      case 'PENDING':
        return <ClockIcon className="h-4 w-4 mr-1" />;
      default:
        return null;
    }
  };

  // Fetch appointments from API
  const fetchAppointments = async (isRefreshing = false) => {
    if (!isRefreshing) {
      setLoading(true);
    }
    setRefreshing(true);
    setError(null);
    
    try {
      // Get the patient ID from localStorage
      const userData = localStorage.getItem('user');
      if (!userData) {
        throw new Error('You must be logged in to view appointments');
      }

      const user = JSON.parse(userData);
      const patientId = user.id || user.P_ID || user.patientId;
      
      if (!patientId) {
        throw new Error('Unable to determine patient ID');
      }

      console.log('Fetching appointments for patient ID:', patientId);
      
      // Make API call to fetch appointments
      const response = await appointmentService.getAppointmentsByPatient(patientId);
      console.log('Appointments API response:', response);
      
      // Process the response data
      let appointmentsData = [];
      
      if (Array.isArray(response)) {
        appointmentsData = response;
      } else if (response && Array.isArray(response.data)) {
        appointmentsData = response.data;
      } else if (response?.data?.appointments) {
        appointmentsData = response.data.appointments;
      } else if (response?.data) {
        appointmentsData = [response.data];
      }
      
      console.log('Processed appointments data:', appointmentsData);
      
      // Update state with the processed data
      setAppointments(appointmentsData);
      
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError(error.message || 'Failed to load appointments');
      toast.error(error.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle appointment cancellation
  const handleCancelAppointment = async (appointmentId) => {
    if (!appointmentId) {
      toast.error('Invalid appointment ID');
      return;
    }
    
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }
    
    setCancelingId(appointmentId);
    
    try {
      await appointmentService.updateAppointmentStatus(appointmentId, 'CANCELLED');
      toast.success('Appointment cancelled successfully');
      fetchAppointments(); // Refresh the list
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error(error.message || 'Failed to cancel appointment');
    } finally {
      setCancelingId(null);
    }
  };

  // Filter appointments based on active tab and status
  const filteredAppointments = appointments.filter(appointment => {
    // Filter by tab (upcoming/past)
    const isUpcomingAppointment = isUpcoming(appointment.appointment_date, appointment.appointment_time);
    if (activeTab === 'upcoming' && !isUpcomingAppointment) return false;
    if (activeTab === 'past' && isUpcomingAppointment) return false;
    
    // Filter by status
    if (filterStatus !== 'all' && appointment.status !== filterStatus) {
      return false;
    }
    
    return true;
  });

  // Initial data fetch
  useEffect(() => {
    fetchAppointments();
  }, []);

  // Handle keyboard refresh
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'F5' || (event.ctrlKey && event.key === 'r')) {
        event.preventDefault();
        fetchAppointments(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="space-y-6 p-6">
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
            <Link 
              to="/patient/book-appointment"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-center w-full sm:w-auto"
            >
              Book New Appointment
            </Link>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="px-6 py-4 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`py-3 px-1 font-medium text-sm border-b-2 ${
                activeTab === 'upcoming'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`py-3 px-1 font-medium text-sm border-b-2 ${
                activeTab === 'past'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Past
            </button>
          </nav>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
                Filter by status:
              </label>
              <select
                id="status-filter"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-md text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
            
            <button 
              onClick={() => fetchAppointments(true)}
              disabled={refreshing}
              className="flex items-center text-sm text-primary-600 hover:text-primary-800 disabled:opacity-50"
            >
              {refreshing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
                  Refreshing...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </>
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : error ? (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error loading appointments</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => fetchAppointments(true)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
                <CalendarIcon className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {activeTab === 'upcoming' 
                  ? "You don't have any upcoming appointments."
                  : "You don't have any past appointments."}
              </p>
              <div className="mt-6">
                <Link
                  to="/patient/book-appointment"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Book New Appointment
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
                              className="h-16 w-16 rounded-full object-cover border-2 border-white shadow-sm"
                              src={appointment.doctor.image}
                              alt={appointment.doctor.name}
                            />
                          ) : (
                            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center border-2 border-white shadow-sm">
                              <UserIcon className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {appointment.doctor?.name || 'Doctor not specified'}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {appointment.doctor?.specialization || 'General Practitioner'}
                          </p>
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            <CalendarIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            {appointment.appointment_date ? (
                              <>
                                {formatDate(appointment.appointment_date)}
                                {appointment.appointment_time && (
                                  <>
                                    <span className="mx-2">•</span>
                                    <ClockIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                    {formatTime(appointment.appointment_time)}
                                  </>
                                )}
                              </>
                            ) : (
                              'Date not specified'
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 md:mt-0 flex items-center space-x-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(appointment.status)}`}>
                          {getStatusIcon(appointment.status)}
                          {appointment.status || 'UNKNOWN'}
                        </span>
                        
                        {isUpcoming(appointment.appointment_date, appointment.appointment_time) && 
                         appointment.status !== 'CANCELLED' && 
                         appointment.status !== 'COMPLETED' && (
                          <button
                            onClick={() => handleCancelAppointment(appointment.id)}
                            disabled={cancelingId === appointment.id}
                            className={`inline-flex items-center px-3 py-1 border ${
                              cancelingId === appointment.id 
                                ? 'border-gray-300 bg-gray-100 text-gray-500'
                                : 'border-red-300 text-red-700 bg-white hover:bg-red-50'
                            } text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors`}
                          >
                            {cancelingId === appointment.id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500 mr-2"></div>
                                Cancelling...
                              </>
                            ) : (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Cancel
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {appointment.description && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Notes:</h4>
                        <p className="text-sm text-gray-600">{appointment.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentsFixed;
