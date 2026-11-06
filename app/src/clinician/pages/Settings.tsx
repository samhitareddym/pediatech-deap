// Center setup (Toggle-Switch 12), SSO role permissions (20) and the BAT routing table.

import { useClin } from '../context';
import { BARRIERS, PERMISSIONS, ROLE_LABEL, USERS } from '../data';
import type { Owner, Role } from '../types';
import { CheckIcon, Switch } from '../components/ui';

const OWNER_OPTIONS: Owner[] = ['coord', 'prescriber', 'sw', 'psych', 'community'];
const COLS: Role[] = ['coord', 'sw', 'psych'];

export default function Settings() {
  const { S, ui, update, toast } = useClin();
  const me = ui.user?.role;

  const setPsych = (on: boolean) => {
    update(d => { d.hasPsych = on; [12, 13, 14].forEach(b => { d.routing[b] = on ? 'psych' : b === 13 ? 'community' : 'sw'; }); });
    toast(on ? 'Psychology barriers route to the psychologist' : 'Psychology barriers now route to social work; refusal to a community referral');
  };

  return (
    <div className="page">
      <div className="head"><div>
        <h1>Settings</h1>
        <p className="lead">Routing is site-specific. Change who owns each barrier to fit your center's staff.</p>
      </div></div>

      <section className="card panel">
        <h2>Center setup</h2>
        <Switch id="s-psych" checked={S.hasPsych} onChange={setPsych} title="We have a psychologist on staff"
          help="Turn off to send psychology barriers to the social worker, and refusal to a community referral, without editing each row." />
        <Switch id="s-digest" checked={S.digest} onChange={v => { update(d => { d.digest = v; }); toast(v ? 'Weekly list on' : 'Per-event alerts on'); }}
          title="Weekly list instead of alerts" help="The coordinator gets one list on Monday mornings. Only same-day items (refusal, safety concerns) send a notification." />
      </section>

      <section className="card">
        <div className="panel" style={{ paddingBottom: 6 }}>
          <h2>Role permissions</h2>
          <p className="help">What each SSO role can see and do. Least privilege: social work and psychology see only patients referred to them.</p>
        </div>
        <div className="scroll">
          <table className="perm">
            <thead><tr>
              <th>Permission</th>
              {COLS.map(c => (
                <th key={c} className={me === c ? 'cur' : ''}>
                  <span className="rn">{USERS[c].title}</span>
                  {me === c && <span className="curtag">Current</span>}
                </th>
              ))}
            </tr></thead>
            <tbody>{PERMISSIONS.map(([n, d, who]) => (
              <tr key={n}>
                <td><span className="rn">{n}</span><span className="rs">{d}</span></td>
                {COLS.map(c => (
                  <td key={c} className={me === c ? 'cur' : ''}>
                    {who.includes(c) ? <span className="okc" aria-label="Allowed"><CheckIcon /></span> : <span className="dash" aria-label="Not allowed">{'—'}</span>}
                  </td>
                ))}
              </tr>
            ))}</tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <div className="panel" style={{ paddingBottom: 6 }}>
          <h2>Barrier routing</h2>
          <p className="help">From the 14-item Barriers Assessment Tool. Changes apply to new referrals and to the weekly list right away.</p>
        </div>
        <div className="scroll">
          <table className="route">
            <thead><tr><th>#</th><th>Barrier</th><th>Response</th><th>Owner</th></tr></thead>
            <tbody>{BARRIERS.map(b => (
              <tr key={b.id}>
                <td className="num faint">{b.id}</td>
                <td>{b.label}</td>
                <td className="muted">{b.kind === 'referral' ? 'Referral' : b.kind === 'discussion' ? 'Discussion' : 'Action plan'}</td>
                <td>
                  <select aria-label={`Owner for ${b.short}`} value={S.routing[b.id]}
                    onChange={e => { const v = e.target.value as Owner; update(d => { d.routing[b.id] = v; }); toast(`${b.short} now routes to ${ROLE_LABEL[v].label.toLowerCase()}`); }}>
                    {OWNER_OPTIONS.map(o => <option key={o} value={o}>{ROLE_LABEL[o].label}</option>)}
                  </select>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
