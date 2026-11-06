import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import './maya-story.css'

// A single deterministic clock drives poses, transitions and exported frames.
const CHAPTERS = [0, 5.8, 14.8, 20.8, 29, 35.5]
const DURATION = 42
const LABELS = ['Meet Maya', 'Her own words', 'Message on its way', 'The team is alerted', 'Someone follows up', 'Maya feels heard']
const MESSAGE = 'My medicine tastes bad.'
const REPLY = 'Thanks for telling us, Maya. Let’s work on this together.'
const C = { ink: '#302740', paper: '#faf6ed', purple: '#7660a4', lilac: '#ded5f4', orange: '#f58b67', yellow: '#f5d67d', green: '#c8dfbd', teal: '#507d71', skin: '#bc7c55', face: '#d69a71', hair: '#3c2b37' }
const motionTokens = { transition: 0.65, blink: 4.4 }
const springs = { bouncy: { decay: 6.5, frequency: 10 }, gentle: { decay: 7, frequency: 6 } }
const clamp = (n: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, n))
const ease = (n: number) => 1 - Math.pow(1 - clamp(n), 3)
const pop = (t: number, preset: keyof typeof springs = 'bouncy') => t <= 0 ? 0 : 1 - Math.exp(-springs[preset].decay * t) * Math.cos(springs[preset].frequency * t)
const typed = (text: string, t: number, speed = 15) => text.slice(0, Math.floor(Math.max(0, t) * speed))
const pose = (x = 0, y = 0, scale = 1, rotate = 0) => `translate(${x} ${y}) rotate(${rotate}) scale(${scale})`

declare global {
  interface Window { tendStory?: { seek: (seconds: number) => void; pause: () => void; play: () => void; duration: number } }
}

function Line({ x, y, size = 30, fill = C.ink, weight = 800, children, anchor = 'start', ...rest }: {
  x: number; y: number; size?: number; fill?: string; weight?: number; children: ReactNode; anchor?: 'start' | 'middle' | 'end'; opacity?: number
}) {
  return <text x={x} y={y} fill={fill} fontSize={size} fontWeight={weight} textAnchor={anchor} {...rest}>{children}</text>
}
function Star({ x, y, size = 28, rotate = 0, color = C.purple }: { x: number; y: number; size?: number; rotate?: number; color?: string }) {
  return <path transform={pose(x, y, size / 40, rotate)} d="M0-40Q7-7 40 0Q7 7 0 40Q-7 7-40 0Q-7-7 0-40Z" fill={color} />
}
function Check({ x = 0, y = 0, scale = 1, color = C.ink }: { x?: number; y?: number; scale?: number; color?: string }) {
  return <path transform={pose(x, y, scale)} d="m-10 0 7 7 14-16" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
}

function Character({ x, y, scale = 1, t, nurse = false, happy = false, wave = false, reduced = false }: {
  x: number; y: number; scale?: number; t: number; nurse?: boolean; happy?: boolean; wave?: boolean; reduced?: boolean
}) {
  const bob = reduced ? 0 : Math.sin(t * 2.5) * 3
  const blink = !reduced && t > 0 && t % motionTokens.blink > 4.15 ? 0.12 : 1
  const hand = wave && !reduced ? Math.sin(t * 8) * 13 : 0
  return <g transform={pose(x, y + bob, scale)} aria-label={nurse ? 'Nurse Kim' : 'Maya'}>
    <ellipse cy="223" rx="106" ry="14" fill={C.ink} opacity=".1" />
    <path d="m-41 149-8 62m85-62 11 62" fill="none" stroke={nurse ? '#393b58' : '#74669c'} strokeWidth="39" strokeLinecap="round" />
    <path d="m-73 211 42 0m61 0 42 0" stroke={C.ink} strokeWidth="22" strokeLinecap="round" />
    <path d="M-84 132v-43q0-56 83-56t85 56v43q-83 29-168 0" fill={nurse ? C.teal : C.orange} stroke={C.ink} strokeWidth="4" />
    <path d="M-85 73q-31 19-25 68" fill="none" stroke={nurse ? C.teal : C.orange} strokeWidth="34" strokeLinecap="round" />
    <path d="M-110 137l7 11" stroke={C.face} strokeWidth="24" strokeLinecap="round" />
    <g transform={pose(72, 69, 1, wave ? -87 + hand : -7)}><path d="M0 0q26 13 37 62" fill="none" stroke={nurse ? C.teal : C.orange} strokeWidth="31" strokeLinecap="round" /><path d="m37 57 2 16" stroke={C.face} strokeWidth="23" strokeLinecap="round" />{wave && <path d="m38 77-12 0m11-1 13 4" stroke={C.face} strokeWidth="8" strokeLinecap="round" />}</g>
    <path d="M-23 15v31q23 17 46 0V15" fill={C.skin} />
    {!nurse && <><ellipse cx="93" cy="-64" rx="37" ry="62" fill={C.hair} transform="rotate(-14 93 -64)" /><path d="m78-105 26 9" stroke={C.yellow} strokeWidth="13" strokeLinecap="round" /></>}
    <path d="M-92-58q-9-99 84-101 107-2 100 108l-18 41H-77Z" fill={nurse ? '#634846' : C.hair} />
    <ellipse cx="-79" cy="-49" rx="15" ry="21" fill={C.skin} /><ellipse cx="79" cy="-49" rx="15" ry="21" fill={C.skin} />
    <path d="M-77-84q50 3 90-44 12 36 65 43v43q0 74-77 79-78-5-78-79Z" fill={C.face} stroke={C.ink} strokeWidth="3" />
    <path d={happy || nurse ? 'M-52-63q11-8 23-1M29-64q11-8 23 1' : 'M-52-62l23-5m58 0 23 5'} fill="none" stroke={C.hair} strokeWidth="5" strokeLinecap="round" />
    <g transform={`translate(0 -45) scale(1 ${blink})`}><ellipse cx="-39" rx="5" ry="8" fill={C.ink} /><ellipse cx="39" rx="5" ry="8" fill={C.ink} /></g>
    <path d="m-2-40-5 16h11" stroke={C.skin} strokeWidth="3" fill="none" strokeLinecap="round" /><ellipse cx="-58" cy="-20" rx="14" ry="7" fill="#d6746d" opacity=".65" /><ellipse cx="58" cy="-20" rx="14" ry="7" fill="#d6746d" opacity=".65" />
    <path d={happy || nurse ? 'M-21-5q21 23 42 0' : 'M-19 5q19-12 38 0'} fill={happy ? '#fff7e9' : 'none'} stroke="#743e3a" strokeWidth="4" strokeLinecap="round" />
    {nurse ? <><path d="m-38 47 13 38h50l13-38" fill="none" stroke={C.paper} strokeWidth="5" /><circle cy="94" r="12" fill={C.paper} stroke={C.ink} strokeWidth="3" /><rect x="40" y="92" width="25" height="36" rx="4" fill={C.paper} /><path d="m46 101h13m-13 8h9" stroke={C.teal} strokeWidth="3" /><g fill="none" stroke={C.ink} strokeWidth="3"><rect x="-61" y="-58" width="44" height="30" rx="11" /><rect x="17" y="-58" width="44" height="30" rx="11" /><path d="M-17-47h34" /></g></> : <><path d="M-64 99q64 16 128 0" fill="none" stroke="#f9b58c" strokeWidth="10" /><Star x={0} y={73} size={15} color={C.yellow} /></>}
  </g>
}
function Message({ x, y, scale = 1, rotate = 0 }: { x: number; y: number; scale?: number; rotate?: number }) {
  return <g transform={pose(x, y, scale, rotate)}><rect x="-235" y="-70" width="470" height="145" rx="30" fill={C.ink} opacity=".12" transform="translate(8 10)" /><rect x="-235" y="-70" width="470" height="145" rx="30" fill={C.yellow} stroke={C.ink} strokeWidth="3" /><Line x={-205} y={-33} size={15}>A LITTLE NOTE FROM MAYA</Line><Line x={0} y={16} size={31} anchor="middle">“{MESSAGE}”</Line><path d="m-174 75-29 25 2-25" fill={C.yellow} stroke={C.ink} strokeWidth="3" /></g>
}
function Bell({ x, y, t, scale = 1, reduced = false }: { x: number; y: number; t: number; scale?: number; reduced?: boolean }) {
  const rotate = reduced ? 0 : Math.sin(t * 25) * 22 * Math.exp(-Math.max(0, t - .3) * 2)
  return <g transform={pose(x, y, scale, rotate)}><path d="M-23 10v-15q0-26 23-26T23-5v15l10 12h-66Z" fill={C.yellow} stroke={C.ink} strokeWidth="3.5" strokeLinejoin="round" /><path d="M-8 30q8 11 16 0M0-31v-7" fill="none" stroke={C.ink} strokeWidth="4" strokeLinecap="round" /><circle cx="27" cy="-25" r="14" fill={C.orange} stroke={C.ink} strokeWidth="3" /><Line x={27} y={-20} size={15} anchor="middle">1</Line></g>
}
function Hand({ x, y, scale = 1, rotate = 0 }: { x: number; y: number; scale?: number; rotate?: number }) {
  return <g transform={pose(x, y, scale, rotate)}><path d="M0 65V-5q0-18 16-18T32-5v29q7-15 20-5 12-10 24 1 17-6 21 13l-1 34q-1 27-23 43H27Q4 99-14 78l-21-28q-9-15 4-21 8-5 17 7L0 51" fill={C.face} stroke={C.ink} strokeWidth="3.5" strokeLinejoin="round" /><path d="M29 108h45v28H29Z" fill={C.orange} stroke={C.ink} strokeWidth="3" /></g>
}

function Intro({ t, reduced }: { t: number; reduced: boolean }) {
  return <><circle cx="1170" cy="500" r="330" fill={C.lilac} /><path d="M1010 827q-120-215-240-21" fill={C.green} /><path d="M1500 825q-50-267-168-55" fill={C.orange} />
    <g transform={pose(105)} opacity={ease(t / .7)}><Line x={0} y={222} size={17} fill={C.purple}>SMALL MOMENTS. BETTER CARE.</Line><Line x={0} y={323} size={86}>Meet Maya.</Line><Line x={0} y={410} size={70}>Big feelings.</Line><Line x={0} y={497} size={70}>Little medicine.</Line><Line x={2} y={573} size={25} weight={500}>Some days, taking it is hard.</Line><g transform={pose(0, 622)}><rect width="230" height="48" rx="24" fill={C.ink} /><Line x={115} y={31} size={17} fill={C.paper} anchor="middle">Let’s hear her side ↗</Line></g></g>
    <g transform={pose(1160, 560, reduced ? 1 : pop(t - .3, 'gentle'))}><Character x={0} y={0} scale={1.18} t={t} reduced={reduced} /></g>
    <g transform={pose(1135, 234, reduced ? 1 : pop(t - 1))}><path d="M-185-69H166q34 0 34 34v75q0 34-34 34H-89l-44 33 7-33h-59q-34 0-34-34v-75q0-34 34-34" fill={C.paper} stroke={C.ink} strokeWidth="3" /><Line x={-6} y={-15} size={26} anchor="middle">“I know I need it.</Line><Line x={-6} y={27} size={27} fill={C.purple} anchor="middle">I just hate the taste.”</Line></g>
    <g transform={pose(1410, 660, reduced ? 1 : pop(t - 1.8), reduced ? 0 : -9 + Math.sin(t * 2) * 3)}><rect x="-37" y="-60" width="74" height="117" rx="15" fill={C.paper} stroke={C.ink} strokeWidth="4" /><rect x="-40" y="-75" width="80" height="27" rx="8" fill={C.yellow} stroke={C.ink} strokeWidth="4" /><rect x="-37" y="-8" width="74" height="40" fill={C.orange} /><path d="M-15 13h30m-15-15v30" stroke={C.ink} strokeWidth="5" strokeLinecap="round" /></g><Star x={834} y={264} size={30} rotate={reduced ? 0 : t * 10} /><Star x={1444} y={383} size={18} color={C.orange} /></>
}
function InputScene({ t, reduced }: { t: number; reduced: boolean }) {
  const value = typed(MESSAGE, t - 2.05, 12)
  const sent = t >= 6.45
  const tap = clamp((t - 5.8) / .65)
  return <><circle cx="140" cy="650" r="410" fill={C.orange} opacity=".18" /><circle cx="1310" cy="290" r="365" fill={C.lilac} /><g opacity={ease(t / .65)}><Line x={100} y={210} size={18} fill={C.purple}>01 / SAY IT YOUR WAY</Line><Line x={100} y={292} size={66}>No perfect words</Line><Line x={100} y={367} size={66}>needed.</Line><Line x={103} y={424} size={24} weight={500}>Just tell us what’s hard.</Line></g><Character x={350} y={631} scale={.72} t={t} happy={sent} wave={sent} reduced={reduced} />
    <g transform={pose(975, 147, reduced ? 1 : .88 + .12 * pop(t, 'gentle'))}><rect x="10" y="17" width="421" height="606" rx="42" fill={C.ink} opacity=".13" /><rect width="421" height="606" rx="42" fill={C.paper} stroke={C.ink} strokeWidth="8" /><rect x="160" y="16" width="100" height="18" rx="9" fill={C.ink} /><Line x={29} y={66} size={15}>9:41</Line><Line x={384} y={66} size={16} anchor="end">▰</Line><circle cx="47" cy="110" r="19" fill={C.lilac} /><Line x={47} y={117} size={22} anchor="middle">t.</Line><Line x={79} y={117} size={22}>Hey, Maya.</Line><Line x={29} y={177} size={31}>What’s making your</Line><Line x={29} y={216} size={31}>medicine tricky?</Line><Line x={29} y={254} size={17} weight={500}>You can tell us anything.</Line><rect x="25" y="279" width="371" height="109" rx="17" fill="#fffefa" stroke={C.purple} strokeWidth="2.5" /><Line x={42} y={320} size={23} weight={700} fill={value ? C.ink : '#978aa4'}>{value || 'Type a little note…'}{t > 2 && !sent && Math.floor(t * 3) % 2 === 0 ? '|' : ''}</Line><Line x={42} y={366} size={13} fill={C.purple} weight={500}>For your care team, in your own words.</Line><rect x="25" y="406" width="371" height="58" rx="17" fill={sent ? C.teal : C.ink} /><Line x={210} y={443} size={21} fill={C.paper} anchor="middle">{sent ? 'Sent to my care team ✓' : 'Send to my care team ↗'}</Line>
      <g opacity={sent ? .25 : 1}>{['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'].map((row, rowIndex) => <g key={row} transform={pose(31 + rowIndex * 15, 493 + rowIndex * 30)}>{[...row].map((letter, i) => <g key={letter}><rect x={i * 35} width="29" height="25" rx="5" fill={t > 2 && t < 4.1 && Math.floor(t * 12) % row.length === i ? C.yellow : '#e9e2ef'} /><Line x={i * 35 + 14} y={18} size={12} anchor="middle">{letter}</Line></g>)}</g>)}</g></g>
    {t > 1.8 && t < 6.6 && <g opacity={ease((t - 1.8) / .4) * (1 - ease((t - 6.35) / .25))}><Hand x={1335 - Math.sin(tap * Math.PI) * 17} y={672 - Math.sin(tap * Math.PI) * 19} scale={.86} rotate={-17} /></g>}
    {sent && <g transform={pose(754, 540, reduced ? 1 : pop(t - 6.45))}><circle r="66" fill={C.green} stroke={C.ink} strokeWidth="3" /><Check scale={2.3} /><Star x={-73} y={-57} size={20} /><Star x={85} y={31} size={15} color={C.orange} /></g>}<g transform={pose(644, 650, reduced ? 1 : pop(t - 4.4), -5)}><Line x={0} y={0} size={25} fill={C.purple} anchor="middle">A brave little message.</Line></g></>
}
function Journey({ t, reduced }: { t: number; reduced: boolean }) {
  const travel = ease((t - .8) / 3.8)
  return <><circle cx="800" cy="470" r="330" fill={C.yellow} opacity=".3" /><Line x={800} y={205} size={65} anchor="middle">Small message.</Line><Line x={800} y={280} size={65} fill={C.purple} anchor="middle">Straight to her people.</Line><path d="M280 610C430 290 1100 280 1330 588" stroke={C.purple} strokeWidth="3" strokeDasharray="5 14" fill="none" strokeLinecap="round" opacity=".5" /><Character x={235} y={643} scale={.61} t={t} happy reduced={reduced} /><Character x={1370} y={643} scale={.61} t={t} nurse reduced={reduced} /><Line x={235} y={817} size={22} anchor="middle">Maya</Line><Line x={1370} y={817} size={22} anchor="middle">Her care team</Line>
    <g transform={pose(reduced ? 800 : 390 + travel * 820, reduced ? 445 : 515 - Math.sin(travel * Math.PI) * 150, reduced ? .8 : .78 + Math.sin(travel * Math.PI) * .13, reduced ? 0 : Math.sin(travel * Math.PI * 2) * -9)}><Message x={0} y={0} /><path d="M-262-10h-55m43 24h-74m79 24h-43" stroke={C.orange} strokeWidth="6" strokeLinecap="round" opacity={Math.sin(travel * Math.PI)} /></g><Star x={533} y={535} size={23} rotate={reduced ? 0 : t * 20} color={C.orange} /><Star x={1060} y={615} size={32} rotate={reduced ? 0 : -t * 12} /><Star x={1137} y={367} size={16} color={C.teal} /><g opacity={ease((t - 3.4) / .5)}><rect x="583" y="685" width="434" height="54" rx="27" fill={C.paper} stroke={C.ink} strokeWidth="2" /><Check x={616} y={711} scale={.65} color={C.teal} /><Line x={642} y={720} size={19}>Her words. No translation needed.</Line></g></>
}
function Clinician({ t, reduced }: { t: number; reduced: boolean }) {
  const arrived = t >= 1.3
  const landing = reduced ? 1 : pop(t - 1.3)
  return <><circle cx="1440" cy="630" r="430" fill={C.green} /><Line x={100} y={180} size={18} fill={C.purple}>02 / THE RIGHT PERSON HEARS IT</Line><Line x={100} y={257} size={64}>A little ping. A clear next step.</Line>
    <g transform={pose(105, 317)}><rect x="11" y="16" width="1015" height="423" rx="26" fill={C.ink} opacity=".13" /><rect width="1015" height="423" rx="26" fill={C.paper} stroke={C.ink} strokeWidth="6" /><path d="M3 26Q3 3 26 3H989q23 0 23 23v46H3Z" fill={C.lilac} /><Line x={28} y={47} size={29}>tend.</Line><Line x={116} y={46} size={18} weight={600}>Care team</Line><Line x={923} y={46} size={17} anchor="end">Nurse Kim</Line><Bell x={965} y={37} t={t - 1.3} scale={.47} reduced={reduced} /><Line x={31} y={122} size={27}>Patient updates</Line><rect x="829" y="94" width="153" height="36" rx="18" fill={arrived ? C.green : '#e8e3eb'} /><Line x={905} y={118} size={15} anchor="middle">{arrived ? '1 new message' : 'All caught up'}</Line>
      {!arrived && <><rect x="30" y="151" width="950" height="215" rx="20" fill="#f0ecef" /><Line x={505} y={266} size={22} weight={500} fill="#978a9f" anchor="middle">Your patients’ words belong here.</Line></>}
      {arrived && <g transform={pose(505, 260 + (1 - landing) * -70, .94 + landing * .06, reduced ? 0 : (1 - landing) * -5)}><rect x="-475" y="-109" width="950" height="225" rx="21" fill={C.yellow} stroke={C.ink} strokeWidth="2.5" /><circle cx="-431" cy="-64" r="21" fill={C.orange} /><Line x={-431} y={-57} size={21} anchor="middle">M</Line><Line x={-394} y={-69} size={17}>NEW FROM MAYA</Line><Line x={439} y={-69} size={15} weight={600} anchor="end">Just now</Line><Line x={-443} y={-8} size={38}>“{MESSAGE}”</Line><Line x={-442} y={35} size={20} weight={500}>Taste is making her medicine routine difficult.</Line><rect x="-444" y="60" width="145" height="34" rx="17" fill={C.paper} /><Line x={-371} y={83} size={15} anchor="middle">Barrier: taste</Line><Line x={-276} y={83} size={16}>For Nurse Kim · Follow-up needed</Line></g>}</g>
    <Character x={1343} y={625} scale={.84} t={t} nurse happy wave={t > 4} reduced={reduced} />{arrived && <g transform={pose(1300, 350, reduced ? 1 : pop(t - 1.3), -9)}><path d="m-117-31 24-14-5-26 31 6 20-33 26 20 29-16 20 28 37-1 7 31 31 16-22 22 9 29-41 4-23 20-29-17-32 17-18-27-33-8 6-26Z" fill={C.orange} stroke={C.ink} strokeWidth="3" /><Line x={0} y={11} size={36} anchor="middle">ping!</Line></g>}<Line x={109} y={808} size={21} weight={500}>The concern. The context. Someone responsible for following up.</Line></>
}
function Response({ t, reduced }: { t: number; reduced: boolean }) {
  const sent = t >= 4.1
  const reply = typed(REPLY, t - .9, 22)
  const split = reply.lastIndexOf(' ', 32)
  const first = reply.length <= 33 ? reply : reply.slice(0, split)
  const second = reply.length <= 33 ? '' : reply.slice(split + 1)
  return <><circle cx="245" cy="495" r="324" fill={C.green} /><Line x={680} y={196} size={18} fill={C.purple}>03 / TURN AN ANSWER INTO SUPPORT</Line><Line x={680} y={275} size={64}>“Let’s figure it out.”</Line><Character x={300} y={605} scale={1.04} t={t} nurse happy wave reduced={reduced} />
    <g transform={pose(655, 335, reduced ? 1 : pop(t, 'gentle'))}><rect x="10" y="13" width="806" height="341" rx="28" fill={C.ink} opacity=".1" /><rect width="806" height="341" rx="28" fill={C.paper} stroke={C.ink} strokeWidth="3" /><Line x={32} y={47} size={17} fill={C.teal}>NURSE KIM → MAYA</Line><Line x={32} y={116} size={31}>{first}</Line><Line x={32} y={160} size={31}>{second}</Line><path d="M32 194h742" stroke="#ded7df" strokeWidth="2" /><Line x={32} y={233} size={17} weight={500}>Personal follow-up with Maya and her family.</Line><Line x={32} y={266} size={17} weight={500}>Talk about taste. Find support that fits her routine.</Line><g transform={pose(607, 303, sent && !reduced ? 1 + Math.sin(clamp((t - 4.1) / .5) * Math.PI) * .06 : 1)}><rect x="-167" y="-25" width="333" height="48" rx="16" fill={sent ? C.teal : C.ink} /><Line x={0} y={7} size={18} fill={C.paper} anchor="middle">{sent ? 'Sent · Follow-up planned ✓' : 'Send & plan follow-up ↗'}</Line></g></g>
    {t > 3.4 && t < 4.4 && <Hand x={1340} y={641 + Math.sin((t - 3.4) * Math.PI) * -20} scale={.68} rotate={-15} />}{sent && <g transform={pose(1190, 761, reduced ? 1 : pop(t - 4.1), -4)}><rect x="-225" y="-31" width="450" height="60" rx="30" fill={C.lilac} /><Check x={-182} y={0} scale={.7} /><Line x={-152} y={9} size={21}>A real person takes the next step.</Line></g>}<Star x={542} y={399} size={33} color={C.orange} rotate={reduced ? 0 : t * 8} /><Star x={133} y={252} size={22} /></>
}
function Ending({ t, reduced }: { t: number; reduced: boolean }) {
  return <><circle cx="800" cy="564" r="390" fill={C.lilac} /><circle cx="1370" cy="50" r="250" fill={C.yellow} opacity=".5" /><Line x={800} y={205} size={80} anchor="middle">Little message.</Line><Line x={800} y={295} size={80} fill={C.purple} anchor="middle">Big support.</Line><Character x={469} y={592} scale={.87} t={t} happy wave reduced={reduced} /><Character x={1134} y={592} scale={.87} t={t} nurse happy wave reduced={reduced} /><g transform={pose(800, 481, reduced ? 1 : pop(t - .4, 'gentle'))}><rect x="-191" y="-77" width="382" height="205" rx="29" fill={C.paper} stroke={C.ink} strokeWidth="3" /><circle cy="-79" r="37" fill={C.green} stroke={C.ink} strokeWidth="3" /><Check y={-79} scale={1.25} /><Line x={0} y={-6} size={26} anchor="middle">Your team heard you.</Line><Line x={0} y={38} size={19} weight={500} anchor="middle">Nurse Kim will follow up.</Line><Line x={0} y={83} size={18} fill={C.teal} anchor="middle">You don’t have to do this alone.</Line></g><g opacity={ease((t - 1.1) / .7)}><Line x={800} y={779} size={28} anchor="middle">Better routines start with being heard.</Line><Line x={800} y={829} size={15} weight={500} fill="#786b83" anchor="middle">Fictional illustrated journey · Messages and follow-up are simulated.</Line></g>{[{ x: 244, y: 367, color: C.orange }, { x: 1342, y: 502, color: C.orange }, { x: 606, y: 690, color: C.teal }, { x: 1009, y: 361, color: C.purple }].map((star, i) => <Star key={i} {...star} size={reduced ? 22 : 20 + Math.sin(t * 3 + i) * 4} rotate={reduced ? 0 : t * 12} />)}</>
}
const SCENES = [Intro, InputScene, Journey, Clinician, Response, Ending]

export default function MayaStory() {
  const [time, setTime] = useState(0)
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [playing, setPlaying] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const timeRef = useRef(0)
  const anchor = useRef({ wall: 0, time: 0 })
  const capture = new URLSearchParams(window.location.search).has('capture')
  const seek = useCallback((seconds: number) => { const next = clamp(seconds, 0, DURATION); timeRef.current = next; anchor.current = { wall: performance.now(), time: next }; setTime(next) }, [])
  useEffect(() => { const media = window.matchMedia('(prefers-reduced-motion: reduce)'); const change = () => { setReduced(media.matches); if (media.matches) setPlaying(false) }; media.addEventListener('change', change); return () => media.removeEventListener('change', change) }, [])
  useEffect(() => { window.tendStory = { seek, pause: () => setPlaying(false), play: () => setPlaying(true), duration: DURATION }; return () => { delete window.tendStory } }, [seek])
  useEffect(() => {
    if (!playing) return
    anchor.current = { wall: performance.now(), time: timeRef.current }
    let id = 0
    const tick = (now: number) => { const next = Math.min(DURATION, anchor.current.time + (now - anchor.current.wall) / 1000); timeRef.current = next; setTime(next); if (next < DURATION) id = requestAnimationFrame(tick); else setPlaying(false) }
    id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [playing])
  const scene = CHAPTERS.reduce((active, start, i) => time >= start ? i : active, 0)
  const elapsed = time - CHAPTERS[scene]
  const cross = reduced ? 1 : ease(elapsed / motionTokens.transition)
  const toggle = () => { if (timeRef.current >= DURATION) seek(0); setPlaying(p => !p) }
  const draw = (i: number, opacity = 1, offset = 0) => { const Scene = SCENES[i]; return <g key={i} opacity={opacity} transform={pose(offset)}><Scene t={time - CHAPTERS[i]} reduced={reduced} /></g> }
  return <main className={`maya-story ${capture ? 'ms-capture' : ''}`} data-scene={scene} data-finished={time >= DURATION}>
    <div className="ms-player"><svg className="ms-canvas" viewBox="0 0 1600 900" role="img" aria-labelledby="ms-film-title ms-film-desc"><title id="ms-film-title">Maya’s little message</title><desc id="ms-film-desc">A 42-second animated story. Maya types “My medicine tastes bad.” Her message travels to Nurse Kim’s inbox, triggers an alert, and leads to a personal follow-up.</desc><rect width="1600" height="900" fill={C.paper} />{scene > 0 && cross < 1 && draw(scene - 1, 1 - cross, -90 * cross)}{draw(scene, cross, reduced ? 0 : (1 - cross) * 100)}<g transform="translate(62 65)"><Line x={0} y={0} size={44} weight={900}>tend<tspan fill={C.orange}>.</tspan></Line><path d="M134-23v25" stroke={C.ink} opacity=".2" /><Line x={158} y={-4} size={16} weight={600}>A little closer to care.</Line></g><Line x={1538} y={61} size={14} weight={600} anchor="end" fill="#786b83">MAYA’S LITTLE MESSAGE</Line>{!capture && <g aria-hidden="true"><rect y="894" width="1600" height="6" fill={C.lilac} /><rect y="894" width="1600" height="6" fill={C.purple} transform={`scale(${time / DURATION} 1)`} /></g>}</svg>
      {!capture && <div className="ms-controls"><button className="ms-play" onClick={toggle} aria-label={playing ? 'Pause story' : time >= DURATION ? 'Replay story' : 'Play story'}>{playing ? 'Ⅱ' : time >= DURATION ? '↻' : '▶'}</button><div className="ms-control-title"><strong>Maya’s little message</strong><span aria-live="polite">{LABELS[scene]}</span></div><label className="ms-scrubber"><span className="ms-sr-only">Story position</span><input type="range" min="0" max={DURATION} step=".1" value={time} onChange={e => seek(Number(e.target.value))} aria-valuetext={`${Math.floor(time)} seconds of ${DURATION}`} /></label><span className="ms-time">0:{String(Math.floor(time)).padStart(2, '0')} / 0:42</span><button className="ms-restart" onClick={() => { seek(0); setPlaying(true) }} aria-label="Restart story">↺</button></div>}
    </div>
    {!capture && <nav className="ms-chapters" aria-label="Story chapters">{LABELS.map((label, i) => <button key={label} className={scene === i ? 'active' : ''} aria-current={scene === i ? 'step' : undefined} onClick={() => seek(CHAPTERS[i] + .7)}><span>0{i + 1}</span>{label}</button>)}</nav>}
  </main>
}
