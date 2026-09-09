# Team & Accounts

## Team

| Field | Value |
|-------|--------|
| Product / team name | Aegis-IDX |
| Mode | **Solo** |
| Builder | Fahmi |
| Invite / join code | **SKT7-R2C4** |
| Credits | **1,000** |
| Track | Track 1 — Custom orchestration |

## Accounts checklist

- [ ] Sectors Hackathon portal login (Fahmi)
- [ ] Team joined via invite `SKT7-R2C4`
- [ ] Sectors API key issued and stored in local env only
- [ ] GitHub / repo for submission (private OK until submit rules say otherwise)
- [ ] Deployment target (Vercel FE + optional BE host) credentials in env, not repo

## Secrets policy — no commit secrets

**Never commit:**

- `SECTORS_API_KEY`, `OPENAI_API_KEY`, or any token
- `.env`, `.env.local`, `credentials.json`
- Session cookies, private keys, webhook secrets

**Do:**

- Use `.env.example` with placeholder names only
- Document required env vars in `05_BACKEND_SPEC/BACKEND_PRD.md`
- Rotate key if accidentally pushed
- Prefer Vercel / host dashboard env for production

## Collaboration note

Solo build: Fahmi owns FE → BE sequence. If inviting helpers later, still treat API keys as single-owner; share via password manager, not Slack/plain text in repo.
