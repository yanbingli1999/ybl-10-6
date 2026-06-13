import { useMemo, useState } from "react";
import { Heart, Crown, Sparkles, TrendingUp } from "lucide-react";
import { useGameStore } from "@/store/gameStore";
import { BREEDS, BLESSINGS, GUARDIAN_SPIRIT_CONFIG } from "@/data/gameData";
import { ELEMENT_EMOJI, ELEMENT_NAMES } from "@/data/gameData";
import type { BlessingType } from "@/types/game";
import { BlessingModal } from "./BlessingModal";

export function GuardianSpiritPanel() {
  const [modalOpen, setModalOpen] = useState(false);
  const guardianSpirit = useGameStore(s => s.guardianSpirit);
  const beastRelationships = useGameStore(s => s.beastRelationships);
  const breedCureStats = useGameStore(s => s.breedCureStats);
  const currentDay = useGameStore(s => s.currentDay);
  const selectBlessing = useGameStore(s => s.selectBlessing);
  const useBlessing = useGameStore(s => s.useBlessing);

  const guardianBreed = useMemo(() => {
    if (!guardianSpirit.activeBreedId) return null;
    return BREEDS.find(b => b.id === guardianSpirit.activeBreedId);
  }, [guardianSpirit.activeBreedId]);

  const guardianRel = useMemo(() => {
    if (!guardianSpirit.activeBreedId) return null;
    return beastRelationships[guardianSpirit.activeBreedId];
  }, [guardianSpirit.activeBreedId, beastRelationships]);

  const topBreeds = useMemo(() => {
    return Object.values(breedCureStats)
      .sort((a, b) => b.totalCures - a.totalCures)
      .slice(0, 3)
      .map(stat => {
        const breed = BREEDS.find(b => b.id === stat.breedId);
        return { ...stat, breed };
      })
      .filter(item => item.breed);
  }, [breedCureStats]);

  const currentBlessing = useMemo(() => {
    if (!guardianSpirit.currentBlessing) return null;
    return BLESSINGS.find(b => b.id === guardianSpirit.currentBlessing);
  }, [guardianSpirit.currentBlessing]);

  const activeBlessing = useMemo(() => {
    if (!guardianSpirit.blessingUsedToday || !guardianSpirit.currentBlessing) return null;
    return BLESSINGS.find(b => b.id === guardianSpirit.currentBlessing);
  }, [guardianSpirit.blessingUsedToday, guardianSpirit.currentBlessing]);

  const canUseBlessing = guardianBreed && guardianRel &&
    guardianRel.trust >= GUARDIAN_SPIRIT_CONFIG.minTrustForBlessing &&
    !guardianSpirit.blessingUsedToday;

  const handleSelectBlessing = (id: BlessingType) => {
    selectBlessing(id);
  };

  const handleUseBlessing = () => {
    useBlessing();
    setModalOpen(false);
  };

  const trustProgress = guardianRel ? Math.min(100, (guardianRel.trust / 100) * 100) : 0;
  const nextStage = guardianRel ? Math.floor(guardianRel.trust / 25) + 1 : 1;
  const nextAt = nextStage * 25;
  const stageProgress = guardianRel ? ((guardianRel.trust % 25) / 25) * 100 : 0;

  if (!guardianBreed) {
    return (
      <div className="card p-4">
        <h3 className="font-display text-lg text-clinic-deep flex items-center gap-2 mb-3">
          <Crown className="w-5 h-5 text-clinic-amber" />
          诊所守护灵
        </h3>
        <div className="text-center py-6">
          <div className="text-5xl mb-3 opacity-30">🏛️</div>
          <p className="text-sm text-gray-500">暂无守护灵</p>
          <p className="text-xs text-gray-400 mt-1">
            治愈同一品种 {GUARDIAN_SPIRIT_CONFIG.minCuresForGuardian} 次后将凝聚庇护之力
          </p>
          {topBreeds.length > 0 && (
            <div className="mt-4 text-left">
              <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> 治愈排行榜
              </p>
              <div className="space-y-1">
                {topBreeds.map((stat, idx) => (
                  <div key={stat.breedId} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1">
                      <span className="w-4 text-center">{idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"}</span>
                      <span>{stat.breed?.emoji} {stat.breed?.name}</span>
                    </span>
                    <span className="text-gray-500 tabular-nums">{stat.totalCures} 次</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="card p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-lg text-clinic-deep flex items-center gap-2">
            <Crown className="w-5 h-5 text-clinic-amber" />
            诊所守护灵
          </h3>
          {activeBlessing && (
            <span className="tag bg-emerald-100 text-emerald-700 border-emerald-300 text-xs">
              {activeBlessing.emoji} {activeBlessing.name} 生效中
            </span>
          )}
        </div>

        <div className="flex items-start gap-3 mb-3">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-white border-2 border-amber-300 flex items-center justify-center text-4xl shadow-lg">
              {guardianRel?.evolved && guardianRel.highestStage > 0
                ? guardianBreed.evolutionEmojis[Math.min(guardianRel.highestStage, guardianBreed.evolutionEmojis.length - 1)]
                : guardianBreed.emoji}
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center text-white text-xs font-bold shadow">
              👑
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-clinic-deep flex items-center gap-1">
              {guardianBreed.name}
              <span className="text-xs text-gray-500">
                {ELEMENT_EMOJI[guardianBreed.element]} {ELEMENT_NAMES[guardianBreed.element]}系
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              {"⭐".repeat(guardianBreed.rarity)} · 已守护 {Math.max(1, currentDay - (guardianSpirit.lastBlessingDay || currentDay))} 天
            </div>
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="flex items-center gap-0.5 text-gray-600">
                  <Heart className="w-3 h-3 text-pink-400" /> 亲密度
                </span>
                <span className="tabular-nums font-semibold">{guardianRel?.trust ?? 0}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-pink-400 to-amber-400 transition-all"
                  style={{ width: `${trustProgress}%` }}
                />
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5 text-right">
                每日自然消耗 {GUARDIAN_SPIRIT_CONFIG.trustDecayPerDay} 点
              </div>
            </div>
          </div>
        </div>

        {guardianRel && (
          <div className="text-xs bg-white/60 rounded-lg p-2 mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-600">进化阶段</span>
              <span className="text-amber-600 font-semibold">
                {guardianRel.evolved ? `Lv.${guardianRel.highestStage}` : "初始形态"}
              </span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all"
                style={{ width: `${stageProgress}%` }}
              />
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">
              下一进化阶段需 {nextAt} 点亲密度
            </div>
          </div>
        )}

        {currentBlessing && !guardianSpirit.blessingUsedToday && (
          <div className="bg-amber-100/80 rounded-lg p-2 mb-3 border border-amber-200">
            <div className="text-xs font-semibold text-amber-800 flex items-center gap-1 mb-1">
              <Sparkles className="w-3 h-3" />
              已选择祝福
            </div>
            <div className="text-sm text-amber-900">
              {currentBlessing.emoji} {currentBlessing.name}
            </div>
            <div className="text-[10px] text-amber-700 mt-0.5">
              消耗 {currentBlessing.trustCost} 点亲密度
            </div>
          </div>
        )}

        <button
          onClick={() => setModalOpen(true)}
          disabled={!canUseBlessing && !guardianSpirit.blessingUsedToday}
          className={`w-full py-2 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
            canUseBlessing
              ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-md hover:shadow-lg"
              : guardianSpirit.blessingUsedToday
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          {guardianSpirit.blessingUsedToday
            ? "今日祝福已使用"
            : guardianRel && guardianRel.trust < GUARDIAN_SPIRIT_CONFIG.minTrustForBlessing
            ? `亲密度需达到 ${GUARDIAN_SPIRIT_CONFIG.minTrustForBlessing}`
            : "选择今日祝福"}
        </button>

        {topBreeds.length > 0 && (
          <div className="mt-3 pt-3 border-t border-amber-200">
            <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> 治愈排行榜
            </p>
            <div className="space-y-1">
              {topBreeds.map((stat, idx) => (
                <div
                  key={stat.breedId}
                  className={`flex items-center justify-between text-xs ${
                    stat.breedId === guardianSpirit.activeBreedId ? "text-amber-700 font-semibold" : "text-gray-600"
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <span className="w-4 text-center">{idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"}</span>
                    <span>{stat.breed?.emoji} {stat.breed?.name}</span>
                  </span>
                  <span className="tabular-nums">{stat.totalCures} 次</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <BlessingModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelect={handleSelectBlessing}
        onUse={handleUseBlessing}
        selectedBlessing={guardianSpirit.currentBlessing}
        guardianRel={guardianRel}
        blessingCooldowns={guardianSpirit.blessingCooldowns}
      />
    </>
  );
}
