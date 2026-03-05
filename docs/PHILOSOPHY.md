# Product Philosophy

> We're not here to write code. We're here to make a dent in the universe.

---

## Who We Are

BarberApp is a tool built by craftsmen for craftsmen. Every barber who opens this app should feel like someone who _gets it_ designed it for them. Not a committee. Not an algorithm. A person who cared.

---

## 5 Principles

### 1. Think Different First

Before implementing, ask: _why does it have to work that way?_

**In practice:**

- Before any new feature, propose at least 1 non-obvious alternative
- Question the user's first instinct (including our own) — the second idea is usually better
- Study how the best apps solve similar problems (Linear, Vercel, Apple Contacts) before writing a line

**Gate:** "Did we consider another approach?" If no, pause.

---

### 2. Obsess Over Every Detail

The difference between good and great is 100 small things done right.

**In practice:**

- NEVER declare UI "done" without a screenshot — visual verification is mandatory, not optional
- Touch targets are 44px minimum. Always. No exceptions.
- Animations use design-system tokens, not hardcoded values
- Copy is in Spanish, consistent, and speaks like a human — not a machine
- Dark mode, mobile, desktop — all verified, every time

**Gate:** "Did we see it with our own eyes?" If no, screenshot first.

---

### 3. Plan Before You Build

A well-reasoned plan is worth more than a fast implementation.

**In practice:**

- Complex features get a written plan before code (architecture, edge cases, exit criteria)
- Database changes require reading DATABASE_SCHEMA.md first — no assumptions
- Socratic Gate: clarify ambiguity _before_ building, not after
- Document decisions in DECISIONS.md so future-us understands why

**Gate:** "Could someone else understand this plan?" If no, simplify it.

---

### 4. Simplify Ruthlessly

Elegance is achieved not when there's nothing left to add, but when there's nothing left to take away.

**In practice:**

- After implementing, review: what can we remove without losing value?
- KPIs as text, not cards. Rows, not bordered containers. One action button, not three.
- If a component does too many things, split it. If an abstraction serves one use, inline it.
- No feature flags for things we can just ship. No backwards-compat shims for code we control.
- Three lines of clear code > one clever abstraction

**Gate:** "Is there anything here we don't need?" If yes, cut it.

---

### 5. Iterate Until It Sings

The first version is never the final version. Ship fast, then refine.

**In practice:**

- v1 ships quickly — working, tested, not perfect
- v2 comes from real feedback (screenshots, user testing, our own eyes)
- Every polish session makes the product measurably better (Session 198's principles prove this)
- When the user says "se ve mal" — Playwright immediately, fix before moving on

**Gate:** "Would we be proud to show this to a barber?" If no, one more pass.

---

## The Reality Distortion Field

When something seems impossible, that's the cue to think harder — not to settle for less. The people crazy enough to think they can build the best barber app in Costa Rica are the ones who will.

---

## How This Connects to Daily Work

| Principle              | CLAUDE.md Rule                       | Trigger                         |
| ---------------------- | ------------------------------------ | ------------------------------- |
| Think Different        | Socratic Gate Protocol               | Before any new feature          |
| Obsess Over Details    | Auto-Preview (mandatory screenshots) | After any UI change             |
| Plan Before You Build  | Database Change Protocol             | Before any DB/architecture work |
| Simplify Ruthlessly    | Post-implementation review           | After completing a feature      |
| Iterate Until It Sings | Chrome DevTools verification         | Before declaring "done"         |

These aren't aspirational — they're enforced in every session through the existing automation in CLAUDE.md.

---

## One More Thing

Technology alone is not enough. It's technology married with understanding — understanding the barber who checks their phone between cuts, the client who books at midnight, the owner who just wants to know if today was a good day.

Our code should feel inevitable. Like there was no other way it could have been built.
