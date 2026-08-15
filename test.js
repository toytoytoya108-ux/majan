const { calculateScore, calculateFu } = require('./engine');

let pass = 0, fail = 0;
const fails = [];

function eq(name, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (ok) pass++; else { fail++; fails.push(`${name}\n   got : ${JSON.stringify(got)}\n   want: ${JSON.stringify(want)}`); }
}

// helper: [子ロン, 親ロン, 子ツモ表記, 親ツモ表記]
function suite(fu, han, childRon, dealerRon, childTsumo, dealerTsumo) {
  const t = `${fu}符${han}翻`;
  eq(`${t} 子ロン`, calculateScore({ playerType: 'child', winType: 'ron', fu, han }).total, childRon);
  eq(`${t} 親ロン`, calculateScore({ playerType: 'dealer', winType: 'ron', fu, han }).total, dealerRon);
  eq(`${t} 子ツモ`, calculateScore({ playerType: 'child', winType: 'tsumo', fu, han }).notation, childTsumo);
  eq(`${t} 親ツモ`, calculateScore({ playerType: 'dealer', winType: 'tsumo', fu, han }).notation, dealerTsumo);
}

// ---- 20符（平和ツモ） ----
suite(20, 1, 700, 1000, '400/200', '400オール');
suite(20, 2, 1300, 2000, '700/400', '700オール');
suite(20, 3, 2600, 3900, '1300/700', '1300オール');
suite(20, 4, 5200, 7700, '2600/1300', '2600オール');

// ---- 25符（七対子） ----
suite(25, 2, 1600, 2400, '800/400', '800オール');
suite(25, 3, 3200, 4800, '1600/800', '1600オール');
suite(25, 4, 6400, 9600, '3200/1600', '3200オール');

// ---- 30符 ----
suite(30, 1, 1000, 1500, '500/300', '500オール');
suite(30, 2, 2000, 2900, '1000/500', '1000オール');
suite(30, 3, 3900, 5800, '2000/1000', '2000オール');
suite(30, 4, 7700, 11600, '3900/2000', '3900オール');
suite(30, 5, 8000, 12000, '4000/2000', '4000オール');

// ---- 40符 ----
suite(40, 1, 1300, 2000, '700/400', '700オール');
suite(40, 2, 2600, 3900, '1300/700', '1300オール');
suite(40, 3, 5200, 7700, '2600/1300', '2600オール');
suite(40, 4, 8000, 12000, '4000/2000', '4000オール'); // 満貫繰り上がり

// ---- 50符 ----
suite(50, 1, 1600, 2400, '800/400', '800オール');
suite(50, 2, 3200, 4800, '1600/800', '1600オール');
suite(50, 3, 6400, 9600, '3200/1600', '3200オール');
suite(50, 4, 8000, 12000, '4000/2000', '4000オール');

// ---- 60符 ----
suite(60, 1, 2000, 2900, '1000/500', '1000オール');
suite(60, 2, 3900, 5800, '2000/1000', '2000オール');
suite(60, 3, 7700, 11600, '3900/2000', '3900オール');

// ---- 70符 ----
suite(70, 1, 2300, 3400, '1200/600', '1200オール');
suite(70, 2, 4500, 6800, '2300/1200', '2300オール');
suite(70, 3, 8000, 12000, '4000/2000', '4000オール'); // 70符3翻=2240 → 満貫

// ---- 110符（境界） ----
suite(110, 1, 3600, 5300, '1800/900', '1800オール');
suite(110, 2, 7100, 10600, '3600/1800', '3600オール');

// ---- 満貫以上 ----
suite(30, 6, 12000, 18000, '6000/3000', '6000オール');   // 跳満
suite(30, 8, 16000, 24000, '8000/4000', '8000オール');   // 倍満
suite(30, 11, 24000, 36000, '12000/6000', '12000オール'); // 三倍満
suite(30, 13, 32000, 48000, '16000/8000', '16000オール'); // 数え役満

// ---- 区分名 ----
eq('4翻30符は満貫でない', calculateScore({ playerType: 'child', winType: 'ron', fu: 30, han: 4 }).rank, null);
eq('4翻40符は満貫', calculateScore({ playerType: 'child', winType: 'ron', fu: 40, han: 4 }).rank, '満貫');
eq('3翻70符は満貫', calculateScore({ playerType: 'child', winType: 'ron', fu: 70, han: 3 }).rank, '満貫');
eq('5翻は満貫', calculateScore({ playerType: 'child', winType: 'ron', fu: 20, han: 5 }).rank, '満貫');
eq('6翻は跳満', calculateScore({ playerType: 'child', winType: 'ron', fu: 20, han: 6 }).rank, '跳満');
eq('7翻は跳満', calculateScore({ playerType: 'child', winType: 'ron', fu: 20, han: 7 }).rank, '跳満');
eq('8翻は倍満', calculateScore({ playerType: 'child', winType: 'ron', fu: 20, han: 8 }).rank, '倍満');
eq('10翻は倍満', calculateScore({ playerType: 'child', winType: 'ron', fu: 20, han: 10 }).rank, '倍満');
eq('11翻は三倍満', calculateScore({ playerType: 'child', winType: 'ron', fu: 20, han: 11 }).rank, '三倍満');
eq('12翻は三倍満', calculateScore({ playerType: 'child', winType: 'ron', fu: 20, han: 12 }).rank, '三倍満');
eq('13翻は数え役満', calculateScore({ playerType: 'child', winType: 'ron', fu: 20, han: 13 }).rank, '役満');

// ---- 役満 ----
eq('役満 子ロン', calculateScore({ playerType: 'child', winType: 'ron', yakumanMultiplier: 1 }).total, 32000);
eq('役満 親ロン', calculateScore({ playerType: 'dealer', winType: 'ron', yakumanMultiplier: 1 }).total, 48000);
eq('役満 子ツモ', calculateScore({ playerType: 'child', winType: 'tsumo', yakumanMultiplier: 1 }).notation, '16000/8000');
eq('役満 親ツモ', calculateScore({ playerType: 'dealer', winType: 'tsumo', yakumanMultiplier: 1 }).notation, '16000オール');
eq('ダブル役満 子ロン', calculateScore({ playerType: 'child', winType: 'ron', yakumanMultiplier: 2 }).total, 64000);

// ---- 基本点 ----
eq('30符3翻の基本点', calculateScore({ playerType: 'child', winType: 'ron', fu: 30, han: 3 }).basePoints, 960);
eq('40符3翻の基本点', calculateScore({ playerType: 'child', winType: 'ron', fu: 40, han: 3 }).basePoints, 1280);
eq('4翻40符の基本点は2000で頭打ち', calculateScore({ playerType: 'child', winType: 'ron', fu: 40, han: 4 }).basePoints, 2000);

// ---- 切り上げ満貫オプション ----
eq('切り上げ満貫OFFの30符4翻', calculateScore({ playerType: 'child', winType: 'ron', fu: 30, han: 4 }).total, 7700);
eq('切り上げ満貫ONの30符4翻', calculateScore({ playerType: 'child', winType: 'ron', fu: 30, han: 4, kiriageMangan: true }).total, 8000);

// ---- 本場 ----
eq('30符3翻子ロン1本場', calculateScore({ playerType: 'child', winType: 'ron', fu: 30, han: 3, honba: 1 }).total, 4200);
eq('30符3翻子ツモ1本場', calculateScore({ playerType: 'child', winType: 'tsumo', fu: 30, han: 3, honba: 1 }).notation, '2100/1100');

// ---- 符計算 ----
eq('副底+門前ロン+中張暗刻+役牌雀頭=40符', calculateFu({
  menzen: true, winType: 'ron', head: 'yakuhai', wait: 'ryanmen',
  melds: [{ type: 'koutsu', terminal: false, open: false }],
}).fu, 40);
eq('同上の生の符は36', calculateFu({
  menzen: true, winType: 'ron', head: 'yakuhai', wait: 'ryanmen',
  melds: [{ type: 'koutsu', terminal: false, open: false }],
}).rawFu, 36);
eq('門前ロン・順子のみ・両面=30符', calculateFu({ menzen: true, winType: 'ron', wait: 'ryanmen' }).fu, 30);
eq('平和ツモ=20符', calculateFu({ menzen: true, winType: 'tsumo', pinfu: true, wait: 'ryanmen' }).fu, 20);
eq('七対子=25符', calculateFu({ chiitoitsu: true }).fu, 25);
eq('ツモ+么九暗刻+カンチャン=40符', calculateFu({
  menzen: true, winType: 'tsumo', wait: 'kanchan',
  melds: [{ type: 'koutsu', terminal: true, open: false }],
}).fu, 40); // 20+2+8+2=32 → 40
eq('么九暗槓を含む=70符', calculateFu({
  menzen: true, winType: 'ron', wait: 'tanki',
  melds: [{ type: 'kantsu', terminal: true, open: false }],
}).fu, 70); // 20+10+32+2=64 → 70

console.log(`\n  PASS ${pass} / FAIL ${fail}\n`);
if (fail) { fails.forEach((f) => console.log('  ✗ ' + f)); process.exit(1); }
