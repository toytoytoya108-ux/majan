/* ===========================================================
   麻雀 点数計算エンジン (UI非依存 / 日本式リーチ麻雀)
   =========================================================== */

const ceil100 = (n) => Math.ceil(n / 100) * 100;

// 満貫以上の基本点区分
function limitClass(han) {
  if (han >= 13) return { name: '役満', base: 8000, key: 'yakuman' };
  if (han >= 11) return { name: '三倍満', base: 6000, key: 'sanbaiman' };
  if (han >= 8) return { name: '倍満', base: 4000, key: 'baiman' };
  if (han >= 6) return { name: '跳満', base: 3000, key: 'haneman' };
  if (han >= 5) return { name: '満貫', base: 2000, key: 'mangan' };
  return null;
}

/**
 * calculateScore
 * @param {Object} p
 * @param {'dealer'|'child'} p.playerType  親 / 子
 * @param {'ron'|'tsumo'}    p.winType
 * @param {number}           p.han
 * @param {number}           p.fu
 * @param {number}          [p.yakumanMultiplier] 役満の倍数(1=単, 2=ダブル…). 指定時 han/fu は無視
 * @param {boolean}         [p.kiriageMangan] 切り上げ満貫ルール(既定 false)
 * @param {number}          [p.honba] 本場(既定 0)
 * @returns {Object}
 */
function calculateScore(p) {
  const {
    playerType, winType, han, fu,
    yakumanMultiplier = 0, kiriageMangan = false, honba = 0,
  } = p;

  const isDealer = playerType === 'dealer';
  const isTsumo = winType === 'tsumo';

  let basePoints, rank, rankKey, capped = false;

  if (yakumanMultiplier > 0) {
    basePoints = 8000 * yakumanMultiplier;
    rank = yakumanMultiplier === 1 ? '役満' : `${yakumanMultiplier}倍役満`;
    rankKey = 'yakuman';
    capped = true;
  } else {
    const lim = limitClass(han);
    if (lim) {
      basePoints = lim.base;
      rank = lim.name;
      rankKey = lim.key;
      capped = true;
    } else {
      const raw = fu * Math.pow(2, 2 + han);
      if (raw >= 2000 || (kiriageMangan && ((han === 4 && fu === 30) || (han === 3 && fu === 60)))) {
        basePoints = 2000; rank = '満貫'; rankKey = 'mangan'; capped = true;
      } else {
        basePoints = raw; rank = null; rankKey = 'normal';
      }
    }
  }

  let fromDealer = 0, fromChild = 0, fromRonPlayer = 0, total = 0;

  if (isTsumo) {
    if (isDealer) {
      fromChild = ceil100(basePoints * 2);              // 子3人が同額
      total = fromChild * 3;
    } else {
      fromDealer = ceil100(basePoints * 2);
      fromChild = ceil100(basePoints * 1);
      total = fromDealer + fromChild * 2;
    }
  } else {
    fromRonPlayer = ceil100(basePoints * (isDealer ? 6 : 4));
    total = fromRonPlayer;
  }

  // 本場（ロン+300 / ツモは各家+100）
  let honbaTotal = 0;
  if (honba > 0) {
    if (isTsumo) {
      fromDealer += isDealer ? 0 : honba * 100;
      fromChild += honba * 100;
      honbaTotal = honba * 300;
    } else {
      fromRonPlayer += honba * 300;
      honbaTotal = honba * 300;
    }
    total += honbaTotal;
  }

  // 実戦での言い方
  let notation;
  if (isTsumo) {
    notation = isDealer ? `${fromChild}オール` : `${fromDealer}/${fromChild}`;
  } else {
    notation = `${fromRonPlayer}`;
  }

  return {
    basePoints, rank, rankKey, capped,
    total, fromDealer, fromChild, fromRonPlayer,
    notation, isDealer, isTsumo, han, fu,
  };
}

/* ---------- 符計算エンジン ---------- */

const FU_PARTS = {
  base: { label: '副底（基本符）', fu: 20 },
  menzenRon: { label: '門前ロン', fu: 10 },
  tsumo: { label: 'ツモ', fu: 2 },
};

// 面子符
function meldFu({ type, terminal, open }) {
  // type: 'shuntsu' | 'koutsu' | 'kantsu'
  if (type === 'shuntsu') return 0;
  if (type === 'koutsu') {
    if (open) return terminal ? 4 : 2;
    return terminal ? 8 : 4;
  }
  if (type === 'kantsu') {
    if (open) return terminal ? 16 : 8;
    return terminal ? 32 : 16;
  }
  return 0;
}

const WAIT_FU = { ryanmen: 0, shanpon: 0, kanchan: 2, penchan: 2, tanki: 2 };
const HEAD_FU = { yakuhai: 2, other: 0 };

/**
 * calculateFu — 符の内訳と切り上げ後の符を返す
 */
function calculateFu({ menzen, winType, melds = [], head = 'other', wait = 'ryanmen', pinfu = false, chiitoitsu = false, kuipinfu = false }) {
  if (chiitoitsu) return { fu: 25, rawFu: 25, parts: [{ label: '七対子（固定）', fu: 25 }] };
  if (pinfu && winType === 'tsumo') return { fu: 20, rawFu: 20, parts: [{ label: '平和ツモ（固定）', fu: 20 }] };
  if (kuipinfu) return { fu: 30, rawFu: 30, parts: [{ label: '喰い平和形（固定）', fu: 30 }] };

  const parts = [{ label: FU_PARTS.base.label, fu: 20 }];
  if (menzen && winType === 'ron') parts.push({ label: FU_PARTS.menzenRon.label, fu: 10 });
  if (winType === 'tsumo') parts.push({ label: FU_PARTS.tsumo.label, fu: 2 });
  melds.forEach((m) => {
    const f = meldFu(m);
    if (f > 0) parts.push({ label: m.label || '面子', fu: f });
  });
  if (HEAD_FU[head]) parts.push({ label: '役牌の雀頭', fu: HEAD_FU[head] });
  if (WAIT_FU[wait]) parts.push({ label: waitLabel(wait), fu: WAIT_FU[wait] });

  const rawFu = parts.reduce((s, x) => s + x.fu, 0);
  return { fu: Math.ceil(rawFu / 10) * 10, rawFu, parts };
}

function waitLabel(w) {
  return { ryanmen: '両面待ち', shanpon: 'シャンポン待ち', kanchan: 'カンチャン待ち', penchan: 'ペンチャン待ち', tanki: '単騎待ち' }[w];
}

module.exports = { calculateScore, calculateFu, meldFu, ceil100, limitClass, WAIT_FU, HEAD_FU };
