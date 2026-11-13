import React from 'react';
import { ArrowRight, Clock, Bus, MapPin } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';

export const RouteCard = ({ route, onBook }) => {
  return (
    <Card hover className="p-6 flex flex-col justify-between" onClick={onBook}>
      <div>
        {/* Top Row: Neutral Tag + Distance */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-interactive bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]">
            {route.tag || 'Express'}
          </span>
          <span className="text-xs font-medium text-[#64748B] flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#5B21B6]" />
            {route.distance}
          </span>
        </div>

        {/* Title: 20px / 600 */}
        <div className="flex items-center gap-2 text-xl font-semibold text-[#0F172A] mb-3 leading-snug">
          <span>{route.origin}</span>
          <ArrowRight className="w-4 h-4 text-[#5B21B6] shrink-0" />
          <span>{route.destination}</span>
        </div>

        {/* Meta rows with consistent icons */}
        <div className="space-y-2 text-sm text-[#475569] mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#5B21B6] shrink-0" />
            <span>
              Duration: <strong className="font-semibold text-[#0F172A]">{route.duration}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Bus className="w-4 h-4 text-[#059669] shrink-0" />
            <span>
              Daily Coaches: <strong className="font-semibold text-[#0F172A]">{route.busesCount} Scheduled</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Row: Starting from ₹XX + Visible Primary View Buses Button */}
      <div className="pt-4 border-t border-[#F1F5F9] flex items-center justify-between">
        <div>
          <span className="text-xs text-[#64748B] block font-medium">Starting from</span>
          <span className="text-lg font-bold text-[#5B21B6]">{route.fare}</span>
        </div>
        <Button
          variant="primary"
          onClick={(e) => {
            e.stopPropagation();
            if (onBook) onBook();
          }}
          className="text-xs font-semibold min-h-[40px] px-4"
        >
          View Buses
        </Button>
      </div>
    </Card>
  );
};

export default RouteCard;
