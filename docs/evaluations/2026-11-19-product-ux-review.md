# Tried & Kept: product and UX evaluation

Date: November 19, 2026. Evaluated the live Railway site and an isolated local copy.

**Recommendation: focus the next product sprint on reliable replacement decisions and useful trial outcomes.** The visual identity is distinctive, mobile layouts are behaving well, and the contribution machinery works. Recommendation coverage and an empty, closed community currently limit the value a visitor can get.

This is an expert heuristic review supported by automated browser journeys and database checks. It is not customer research, a conversion experiment, or evidence of product–market fit. Supporting observations and test results are in [the evidence file](2026-11-19-evidence.json).

## What was tested

- Fifteen public pages at 375, 390, 768 and 1280 pixels: **60 checks, all HTTP 200, no horizontal page overflow**. These are Chromium viewport checks, not physical iPhone/Safari testing.
- Mobile menu opening, Escape dismissal and focus return: passed.
- Nine local journeys: signup/confirmation/return to the originating product; adding gear; publishing a detailed returned report; editing a profile and copying its public link; a second player marking the report helpful; two finder scenarios; calculator updates/validation; and the complete eight-question quiz plus replay.
- Additional local checks: password reset, login with the new password, logout and protected-page redirection.
- Database confirmation: the test author had one locker item and one report; the returned report earned 60 XP, another player's helpful vote earned 5 XP, and the total after the other exercised actions was 130 XP. Public profile HTML did not expose the test account's private email.
- Five public accessibility scans found one serious automated rule violation: the horizontally scrollable levels list could not receive keyboard focus. Added `tabIndex={0}` and confirmed keyboard scrolling. Local rescans of home, locker, report form and public profile found no automated WCAG A/AA violations. Automated scans do not establish full accessibility conformance.
- **237 automated tests passed**, along with TypeScript and the production build.

The local email transport was the development test inbox. Production delivery, secure-cookie login on Railway, real affiliate attribution/payouts, native mobile share sheets, field performance and actual customer comprehension remain unverified. The clipboard sharing path was tested; no message was sent to anyone. Production accounts, reviews and email delivery were not used for the account tests.

## Changes made during this review

1. Added an original 1200 × 630 branded share graphic: “Find your next keeper,” tennis court, racquet, ball and outcome stickers. Explicit Open Graph and Twitter metadata replace messaging apps' automatic image selection. Editable source and the PNG are committed; no third-party shoe photo is used in the preview.
2. Fixed the keyboard accessibility issue on the home-page levels list.

The recommendations below are a proposed backlog, not a claim that they have already been implemented.

## What works and should stay

| Strength | Evidence and why it matters |
| --- | --- |
| A recognizable visual identity | Court colors, oversized type, stickers and the newly normalized product photos give the app a coherent tennis identity. The main home CTA is visible on the first phone screen. |
| A useful concrete buying question | The Vapor comparison explains the $45 difference, cushioning and measured width, then connects to the cost-per-hour calculation. It helps with an actual decision. |
| Honest evidence and uncertainty | Dates, source links, lab-test qualifications, pro-use caveats and explicit missing facts protect trust. Avoid replacing them with invented ratings or confidence percentages. |
| Returns are useful contributions | The returned-report journey published successfully and earned detail XP. The incentive does not require a positive verdict or a retailer click. |
| A functioning locker and public profile | Saving gear, updating a profile, sharing the URL and viewing the bag anonymously worked. This is a useful foundation for recommendations that start from gear someone already owns. |
| Mobile mechanics | All audited page-width combinations stayed within the viewport. The menu supports Escape and returns focus. This iteration does not need another visual-system overhaul. |

## What is holding the experience back

### P0: production signup is closed

The live `/signup` page says email is not configured and disables signup. That stops the report, locker and sharing loop from growing. Community invites and “be the first” prompts lead to a blocked action.

**Next action:** configure the mail variables in Railway, then verify a real confirmation and password-reset delivery with the owner account. Local email tests cannot establish that production delivery works. Do this before asking new players to contribute.

### P1: the main recommendation CTA overpromises the available data

There are 23 products: 16 shoes and 7 racquets, plus 8 pros and 4 curated comparisons. Only 2 products have recorded prices, 2 shoes have measured forefoot widths, and 2 have recorded cushioning locations.

I exhaustively checked 432 valid combinations of the finder’s ranking inputs. The entry-point question is excluded because it does not change ranking:

- Only **4 of the 16 shoes can ever appear** in a result.
- **218 of 432 combinations return no match** (50.5%).
- For women's-line inputs, **108 of 144 combinations return no match**; the only eligible model is the women's ASICS wide version.
- The researched men's hard-court/$150/roomy/forefoot scenario correctly returns the Vapor Pro 3.
- The tested women's/clay/$100/unsure scenario ends with “Clay is not covered yet,” after all six questions.

These percentages describe a uniform test grid, not expected visitor failure rates. The ranking is appropriately conservative with unknown data; the problem is the mismatch between the invitation and its coverage.

**Next actions:**

- Tell people which categories and surfaces are supported before the questionnaire. Use “Shoe Match” until a racquet flow exists.
- Populate reliable facts for the existing catalog before adding more models. Include normal-width women's shoes and the price/surface/fit ranges being advertised.
- Route unsupported requests immediately to useful editorial comparisons or a clearly labelled research request. Do not spend six questions collecting an answer the catalog cannot support.
- Ask about the current shoe and the problem to solve. Heel/forefoot cushioning preference is a technical question many visitors cannot answer; “not sure” should still have a useful path.

Run `node scripts/audit-finder.mjs` after catalog changes to repeat the coverage diagnostic.

### P1: discovery often ends without a purchase or trial next step

Only **4 of 23 products have checked retailer offers**. Several attractive product pages end at “No checked retailer link,” missing prices and missing specs. A source-credit link is a weak substitute for an obvious product next step.

**Next action:** finish the details and a checked manufacturer/retailer destination for the initial supported models. Make a clear “Save to try” action using the existing Want to try locker status. Add arbitrary two-model comparison only once enough comparable facts exist. Preserve dated pricing and honest availability labels.

### P1: a long home page delays the first concrete payoff

At 375 × 812, the audited home page was approximately **9,573 CSS pixels tall**, nearly twelve viewport heights. It contains multiple entry doors, a quiz, a price question, a pro spotlight, community counters, a leaderboard, levels, another join section and a moments gallery.

**Next action:** bring a concrete comparison or current-shoe picker directly below the hero. Keep one playful interaction. Move the full levels ladder and most GIFs to Play or the pro pages. A visitor should understand one useful thing before choosing among several destinations.

### P2: empty social proof and prominent XP compete with buyer value

The live community had no published reports or XP leaders. Empty leaderboards and repeated contribution prompts accurately describe the state, but do not give the first visitor much to use. Fields repeatedly decorated with XP also make reporting feel like completing a points checklist.

**Next action:** hide empty podiums and zero-value counters until there is activity. Recruit a small founding group to contribute genuine kept and returned gear experiences. Keep a quick report path—model, verdict, one specific reason—with optional details prefilled from a player's locker where appropriate. Offer the deeper follow-up after someone has actually tried the product.

### P2: the return reason and sharing loop are weak

The quiz replays successfully, but eight fixed spec questions have a limited useful life. Buying gear is episodic, so a daily login target may be artificial. Public profiles work, while their link preview is currently a generic brand card.

**Next action:** give people a reason to return when it helps: a new replacement story for their current model, an update to their shortlist, or their own trial-hours milestone. Later, generate a public “my bag” or switch-story card from public gear data to make sharing meaningful. Keep private fields out of those cards.

## A stronger reason to choose Tried & Kept

**Proposed positioning:** “Find your next keeper through players who made the same gear switch.”

A useful loop would be:

1. Pick the shoe you use now and one problem: toe room, heel slip, comfort after play, wear, or budget.
2. See two credible alternatives when evidence supports them. Each has a clear tradeoff, evidence type, missing facts and relevant kept/returned stories.
3. Save a candidate to the existing Want to try shelf. Let a visitor get value before requiring registration; an anonymous shortlist is worth testing.
4. After a real try-on or session, leave a short outcome. Add size, width, surface and hours to make it useful to the next buyer.
5. Update the player's bag and share a compact switch card: old model → new model → kept/returned → why.

Start with shoe replacement as a focused acquisition experiment. Keep pro and racquet browsing available as discovery paths. Extend recommendations to racquets after the supporting data and use case are strong enough.

Why this is a better direction to validate: [RunRepeat](https://runrepeat.com/catalog/tennis-shoes) already offers extensive tennis-shoe testing and filters; [kit.tennis](https://kit.tennis/) covers pro equipment; [Racket Index](https://racketindex.com/) combines pro setups, comparisons and a daily puzzle. A pro database plus trivia is not sufficient differentiation. The opportunity to test is the combination of specific gear switches, comparable player context and honest post-trial outcomes. This review does not establish that no other product offers that combination.

## Keep, reduce, defer

- **Keep:** the visual system, product imagery, dated evidence, pro caveats, cost-per-hour explanation, returns being equally rewarded, and public lockers.
- **Reduce on home:** repeated CTAs, the full levels ladder, empty leaderboards/counters and the large general GIF gallery. Keep fun in the product, close to a useful choice.
- **Defer:** more generic trivia games, a broad social feed, follows/direct messages, checkout, uploads and a much larger thinly documented catalog. These are not the bottleneck exposed by this audit.
- **Build next:** data coverage, supported-use-case routing, a shortlist from existing locker statuses, current-model comparison, a concise report path and meaningful sharing.

## Suggested sequence and validation gates

| Order | Deliverable | Evidence to look for |
| --- | --- | --- |
| 1 | Open production signup and verify delivery | The owner can confirm an account, reset a password, save gear and publish a real report on Railway. |
| 2 | Complete an initial set of shoe decision paths | Each advertised supported need gets credible choices or an early, useful boundary. Rerun the finder grid; inspect women's, budget, wide and surface cases separately. |
| 3 | Shorten the home/first-visit journey | In observed sessions, a new player can explain the value and reach a useful comparison without coaching. |
| 4 | Recruit founding contributors | A small club cohort supplies genuine contextual switch stories, including returns. Do not simulate community reports or inflate counts. |
| 5 | Add the switch/shortlist feedback loop | Players return after trying something and update the outcome; the resulting story helps another player decide. |

Test with 5–6 actual players: someone replacing a worn-out shoe, a wide-foot player, a women's-shoe shopper, a racquet-focused visitor and a pro-gear fan. Ask them to solve a real task and think aloud. This is proposed research, not completed research.

Measure the funnel from finder start to useful result, shortlist/save, actual trial and reported outcome. Segment no-match rates by need. Also measure report completion and whether a shared bag leads someone to a relevant comparison. Treat affiliate clicks as a secondary commercial signal; XP and time on page alone do not establish usefulness.

**A practical early success criterion:** a small set of supported gear decisions that players can make without help, followed by real trial feedback that improves the next person's choice. That gives the app a durable reason to be visited again.
