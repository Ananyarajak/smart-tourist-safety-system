import React from 'react';
import { Clock, RefreshCw, CheckCircle2, XCircle, ShieldCheck, AlertOctagon, AlertTriangle } from 'lucide-react';

const StatusBadge = ({ status, type = 'status' }) => {
  if (type === 'geofence') {
    switch (status) {
      case 'Safe':
        return (
          <span className="badge badge-safe">
            <ShieldCheck size={12} /> Safe Zone
          </span>
        );
      case 'Restricted':
        return (
          <span className="badge badge-restricted">
            <AlertOctagon size={12} /> Restricted
          </span>
        );
      case 'Caution':
        return (
          <span className="badge badge-caution">
            <AlertTriangle size={12} /> Caution
          </span>
        );
      default:
        return <span className="badge">{status}</span>;
    }
  }

  // Incident status
  switch (status) {
    case 'Pending':
      return (
        <span className="badge badge-pending">
          <Clock size={12} /> Pending Dispatch
        </span>
      );
    case 'In Progress':
      return (
        <span className="badge badge-in-progress">
          <RefreshCw size={12} /> In Progress
        </span>
      );
    case 'Resolved':
      return (
        <span className="badge badge-resolved">
          <CheckCircle2 size={12} /> Resolved
        </span>
      );
    case 'Cancelled':
      return (
        <span className="badge badge-cancelled">
          <XCircle size={12} /> Cancelled
        </span>
      );
    default:
      return <span className="badge">{status}</span>;
  }
};

export default StatusBadge;
