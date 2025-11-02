import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
  const pollingRef = useRef(null);

  const getAppointmentDateStr = (appt) =>
    appt?.appointmentDate ?? appt?.appointment_date ?? appt?.date ?? null;

  const getAppointmentTimeStr = (appt) =>
    appt?.appointmentTime ?? appt?.appointment_time ?? appt?.time ?? null;

  const getAppointmentId = (appt) =>
    appt?.apId ?? appt?.id ?? appt?.appointmentId ?? null;

  const getDescription = (appt) =>
    appt?.descript ?? appt?.Descript ?? appt?.description ?? '';

  // ✅ Safe date parsing: handles undefined, null, empty, or invalid values gracefully
  const parseAppointmentDateTime = (dateStr, timeStr) => {
    try {
      if (!dateStr) return null;

      let safeDate = dateStr?.toString().trim();
      let safeTime = timeStr?.toString().trim();

      if (!safeTime || safeTime.toLowerCase() === 'null' || safeTime === 'undefined') {
        safeTime = '00:00:00';
      }

      // If time looks like "10:30" add seconds
      if (/^\d{1,2}:\d{2}$/.test(safeTime)) {
        safeTime = `${safeTime}:00`;
      }

      // Construct ISO string only if date is valid format
      const isoString = safeDate.includes('T') ? safeDate : `${safeDate}T${safeTime}`;
      const parsed = new Date(isoString);

      if (isNaN(parsed.getTime())) return null;
      return parsed;
    } catch (err) {
      console.error('Date parse error:', err, { dateStr, timeStr });
      return null;
    }
  };

  const isUpcoming = (appt) => {
    const dateStr = getAppointmentDateStr(appt);
    const timeStr = getAppointmentTimeStr(appt);
    const dt = parseAppointmentDateTime(dateStr, timeStr);
    return dt ? dt > new Date() : false;
  };

  const fetchAppointments = useCallback(
    async (isRefreshing = false) => {
      if (!isRefreshing) setLoading(true);
      setRefreshing(true);
      setError(null);

      try {
        console.log('Fetching appointments...');
        const userData = localStorage.getItem('user');
        let patientId = null;

        if (userData && userData !== '{}') {
          try {
            const parsed = JSON.parse(userData);
            patientId = parsed.id ?? parsed.P_ID ?? parsed.patientId ?? parsed.userId ?? null;
            console.log('Parsed user data:', parsed);
          } catch (e) {
            console.error('Error parsing user data from localStorage:', e);
          }
        }

        if (!patientId) {
          try {
            const token = localStorage.getItem('token');
            if (token) {
              const payload = JSON.parse(atob(token.split('.')[1]));
              patientId = payload.id ?? payload.userId ?? payload.sub ?? null;
            }
          } catch (e) {
            console.error('Error extracting id from token:', e);
          }
        }

        if (!patientId) {
          throw new Error('Could not determine patient ID');
        }

        console.log('Using patient ID:', patientId);
        const response = await appointmentService.getAppointmentsByPatient(patientId);
        console.log('Appointments API response:', response);

        let data = [];
        if (Array.isArray(response)) data = response;
        else if (Array.isArray(response?.data)) data = response.data;
        else if (Array.isArray(response?.data?.appointments)) data = response.data.appointments;
        else if (Array.isArray(response?.appointments)) data = response.appointments;
        else if (response && typeof response === 'object') {
          const arr = Object.values(response).find((v) => Array.isArray(v));
          data = arr ?? [];
        }

        console.log('Normalized appointments:', data);
        setAppointments(data);
        setError(null);
      } catch (err) {
        console.error('Error in fetchAppointments:', err);
        setError('Failed to load appointments. ' + (err.message || ''));
        toast.error('Failed to load appointments. ' + (err.message || ''));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  const handleManualRefresh = useCallback(() => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    fetchAppointments().then(() => {
      pollingRef.current = setInterval(() => {
        fetchAppointments(true);
      }, 30000);
    });
  }, [fetchAppointments]);

  useEffect(() => {
    fetchAppointments();
    pollingRef.current = setInterval(() => fetchAppointments(true), 30000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [fetchAppointments]);

  const handleCancelAppointment = async (appointmentId) => {
    if (!appointmentId) return;
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      setCancelingId(appointmentId);
      await appointmentService.cancelAppointment(appointmentId);
      toast.success('Appointment cancelled successfully');
      fetchAppointments();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to cancel appointment');
    } finally {
      setCancelingId(null);
    }
  };

  const filteredAppointments = useMemo(() => {
    let result = Array.isArray(appointments) ? [...appointments] : [];
    if (filterStatus !== 'all') {
      result = result.filter((appt) => (appt?.status ?? '').toString() === filterStatus);
    }
    if (activeTab === 'upcoming') {
      result = result.filter((appt) => isUpcoming(appt));
    } else if (activeTab === 'past') {
      result = result.filter((appt) => !isUpcoming(appt));
    }
    result.sort((a, b) => {
      if (sortBy === 'date') {
        const aDt = parseAppointmentDateTime(getAppointmentDateStr(a), getAppointmentTimeStr(a));
        const bDt = parseAppointmentDateTime(getAppointmentDateStr(b), getAppointmentTimeStr(b));
        if (!aDt && !bDt) return 0;
        if (!aDt) return 1;
        if (!bDt) return -1;
        return aDt - bDt;
      } else if (sortBy === 'doctor') {
        const an = (a?.doctor?.name ?? a?.doctor?.doctorName ?? '').toString();
        const bn = (b?.doctor?.name ?? b?.doctor?.doctorName ?? '').toString();
        return an.localeCompare(bn);
      } else {
        return (a?.status ?? '').toString().localeCompare((b?.status ?? '').toString());
      }
    });
    return result;
  }, [appointments, filterStatus, activeTab, sortBy]);

  const getStatusClass = (status) => {
    switch ((status ?? '').toString()) {
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
    switch ((status ?? '').toString()) {
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

  if (loading && !refreshing) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">My Appointments</h2>
      {filteredAppointments.length === 0 ? (
        <p>No appointments found.</p>
      ) : (
        filteredAppointments.map((appt, i) => (
          <div key={i} className="border rounded-lg p-3 mb-3">
            <h3>{appt?.doctor?.name ?? 'Unknown Doctor'}</h3>
            <p>
              {getAppointmentDateStr(appt)} at {getAppointmentTimeStr(appt)}
            </p>
            <p>Status: {appt?.status ?? 'UNKNOWN'}</p>
            <p>{getDescription(appt)}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default Appointments;
