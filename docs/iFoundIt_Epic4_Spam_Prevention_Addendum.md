# Epic 4 Addendum — Spam and Abuse Prevention

Extends Epic 4 (GDPR-Safe Finder Page + Notification Flow) from the MVP plan. The original debounce rule only stops repeat submissions on the same tag. It doesn't stop a bot working through many different serials. This addendum closes that gap without breaking the finder page's 50 KB budget.

## Layers, in order of cost

| Layer | Cost to finder page | Stops |
|---|---|---|
| Per-tag debounce (existing) | None — server-side DB check | Repeat spam on one tag |
| Honeypot field | ~0.1 KB HTML | Simple bots that auto-fill every field |
| Time-trap | None — server-side comparison | Scripts that submit faster than a human can |
| Vercel WAF rate limiting | None — runs at the edge, before your function | Volume spam, credential-stuffing-style bursts |
| Vercel BotID (reserved) | Small client script, scoped to submit only | Sophisticated bots mimicking real users |

Ship the first four with the MVP. Add BotID only if `found_events` volume shows abuse getting past them — don't spend the byte budget pre-emptively.

## Implementation notes

**Honeypot field**
```html
<input type="text" name="website" style="position:absolute;left:-9999px" tabindex="-1" autocomplete="off">
```
Server-side: if `website` is non-empty, reject silently (return the normal success page, don't tip off the bot).

**Time-trap**
Render a hidden timestamp on page load:
```html
<input type="hidden" name="loaded_at" value="{{ server_timestamp }}">
```
On submit, reject if `now() - loaded_at < 2 seconds`.

**Vercel WAF rate limiting**
Configure via dashboard or `@vercel/firewall`:
```ts
import { checkRateLimit } from '@vercel/firewall';

const { rateLimited } = await checkRateLimit('found-event-submit', {
  rateLimitKey: request.headers.get('x-forwarded-for') ?? 'unknown',
});
if (rateLimited) return new Response('Too many requests', { status: 429 });
```
Suggested starting point: 5 requests per IP per 10 minutes on `/api/found/[serial]`. Tune after the pilot.

**Vercel BotID (reserved)**
```ts
import { checkBotId } from 'botid/server';

const verification = await checkBotId();
if (verification.isBot) {
  return NextResponse.json({ error: 'Request blocked' }, { status: 403 });
}
```
Basic mode is free. Deep Analysis is $1 per 1,000 checks and only bills when called — scope it to `/api/found/[serial]`, not the page view.

## Updated acceptance criteria for Epic 4

Add to the existing list:
- [ ] A request with a filled honeypot field is rejected without an error shown to the sender
- [ ] A submission arriving under 2 seconds after page load is rejected
- [ ] More than 5 found-event submissions from one IP in 10 minutes returns 429, not a database write
- [ ] Rate limit and honeypot rejections are logged for review, not silently dropped
