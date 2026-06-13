import { X, Heart, Sparkles, Clock } from "lucide-react";
import { BLESSINGS, GUARDIAN_SPIRIT_CONFIG } from "@/data/gameData";
import type { BlessingType, BeastRelationship } from "@/types/game";

interface BlessingModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (id: BlessingType) => void;
  onUse: () => void;
  selectedBlessing: BlessingType | null;
  guardianRel: BeastRelationship | null;
  blessingCooldowns: Record<BlessingType, number>;
}

export function BlessingModal({
  open,
  onClose,
  onSelect,
  onUse,
  selectedBlessing,
  guardianRel,
  blessingCooldowns,
}: BlessingModalProps) {
  if (!open) return null;

  const trust = guardianRel?.trust ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden animate-scale-in">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 text-white">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl flex items-center gap-2">
              <Sparkles className="w-6 h-6" />
              选择今日祝福
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-amber-100 mt-1">
            选择一种祝福，由守护灵为诊所施加庇护之力
          </p>
        </div>

        <div className="p-4 space-y-3 overflow-y-auto max-h-[50vh]">
          {BLESSINGS.map(blessing => {
            const cooldown = blessingCooldowns[blessing.id] ?? 0;
            const isOnCooldown = cooldown > 0;
            const hasEnoughTrust = trust >= blessing.trustCost;
            const meetsMinTrust = trust >= GUARDIAN_SPIRIT_CONFIG.minTrustForBlessing;
            const canSelect = !isOnCooldown && hasEnoughTrust && meetsMinTrust;
            const isSelected = selectedBlessing === blessing.id;

            return (
              <button
                key={blessing.id}
                onClick={() => canSelect && onSelect(blessing.id)}
                disabled={!canSelect}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  isSelected
                    ? "border-amber-500 bg-amber-50 shadow-md"
                    : canSelect
                    ? "border-gray-200 hover:border-amber-300 hover:bg-amber-50/50"
                    : "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{blessing.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-clinic-deep">{blessing.name}</h3>
                      {isOnCooldown ? (
                        <span className="tag bg-gray-200 text-gray-600 border-gray-300 text-xs flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          冷却 {cooldown} 天
                        </span>
                      ) : isSelected ? (
                        <span className="tag bg-amber-100 text-amber-700 border-amber-300 text-xs">
                          已选择
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{blessing.description}</p>
                    <p className="text-xs text-clinic-deep mt-2 bg-white/60 rounded-lg p-2">
                      ✨ {blessing.effect}
                    </p>
                    <div className="flex items-center justify-between mt-2 text-xs">
                      <span className="flex items-center gap-1 text-gray-500">
                        <Heart className="w-3 h-3 text-pink-400" />
                        消耗 {blessing.trustCost} 点亲密度
                      </span>
                      {!hasEnoughTrust && !isOnCooldown && (
                        <span className="text-rose-500">亲密度不足</span>
                      )}
                      {!meetsMinTrust && !isOnCooldown && hasEnoughTrust && (
                        <span className="text-rose-500">
                          需达到 {GUARDIAN_SPIRIT_CONFIG.minTrustForBlessing} 点
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
            <span className="flex items-center gap-1">
              <Heart className="w-4 h-4 text-pink-400" />
              当前亲密度: <span className="font-semibold text-clinic-deep">{trust}</span>
            </span>
            <span className="text-xs">
              每日 24:00 自然消耗 {GUARDIAN_SPIRIT_CONFIG.trustDecayPerDay} 点
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-600 font-medium hover:bg-gray-100 transition-colors"
            >
              取消
            </button>
            <button
              onClick={onUse}
              disabled={!selectedBlessing}
              className={`flex-1 py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                selectedBlessing
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-md"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              施展祝福
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
