import React from "react";
import { MapPin, Phone, CheckCircle2, Edit2, Trash2, Star } from "lucide-react";

export const AddressCard = ({
  address,
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,
  onSetDefault,
  isSelectable = false,
}) => {
  if (!address) return null;

  const {
    _id,
    fullName,
    phone,
    addressLine,
    city,
    state,
    pincode,
    country,
    isDefault,
  } = address;

  return (
    <div
      onClick={isSelectable && onSelect ? () => onSelect(address) : undefined}
      className={`relative p-4 sm:p-5 rounded-xl border transition-all duration-200 bg-white ${
        isSelectable ? "cursor-pointer" : ""
      } ${
        isSelected
          ? "border-[#ed1d24] ring-2 ring-red-500/20 shadow-xs bg-red-50/10"
          : "border-slate-200 hover:border-slate-300 shadow-xs"
      }`}
    >
      {/* Header with Name and Default Badge */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          {isSelectable && (
            <div
              className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                isSelected
                  ? "border-[#ed1d24] bg-[#ed1d24] text-white"
                  : "border-slate-300 bg-white"
              }`}
            >
              {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
            </div>
          )}
          <h4 className="font-bold text-slate-900 text-sm sm:text-base font-heading">
            {fullName}
          </h4>
        </div>

        {isDefault && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Star className="w-3 h-3 fill-emerald-600 text-emerald-600" />
            Default
          </span>
        )}
      </div>

      {/* Address Details */}
      <div className="space-y-1.5 text-xs sm:text-sm text-slate-600 mb-4 pl-0.5">
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            {addressLine}, {city}, {state} - <span className="font-semibold text-slate-800">{pincode}</span>, {country || "India"}
          </p>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <Phone className="w-4 h-4 text-slate-400 shrink-0" />
          <span>{phone}</span>
        </div>
      </div>

      {/* Actions footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <div>
          {!isDefault && onSetDefault && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSetDefault(_id);
              }}
              className="text-xs font-semibold text-[#ed1d24] hover:text-[#d32f2f] hover:underline"
            >
              Set as Default
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onEdit && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(address);
              }}
              className="p-1.5 text-slate-500 hover:text-[#ed1d24] hover:bg-red-50 rounded-lg transition-colors"
              title="Edit Address"
              aria-label="Edit address"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(address);
              }}
              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Delete Address"
              aria-label="Delete address"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddressCard;
