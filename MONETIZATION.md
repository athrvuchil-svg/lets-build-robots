# LBR monetization launch plan

**Status:** setup-ready, not yet earning. **Updated:** 2026-11-02.

The website can create qualified traffic and paid-service leads now. It cannot create commission or payment revenue until an account owned by Athrv is approved and connected. Do not publish invented affiliate IDs, payment links, discount codes, or sponsorship claims.

## The fastest path to the first rupee

1. **Publish the paid build-review offer today.** Use `/earn/` and answer the first inquiry manually. Start with a fixed scope: BOM, power, voltage, pins, and a written result. Confirm price and delivery before work begins.
2. **Create a payment link.** Use a payment provider available to you, complete its KYC, and set `PUBLIC_PAYMENT_LINK` in the Cloudflare Pages build environment. Do not accept payment into someone else’s account.
3. **Apply to retailer programs.** Robu has historically advertised an affiliate area, but its availability must be confirmed in the current account. Amazon.in requires approval and says Associates applications are reviewed after at least three qualifying sales within 180 days. Apply with the public LBR site and original content.
4. **Connect only approved IDs.** Copy the exact Robu parameter name and referral ID into `PUBLIC_ROBU_REFERRAL_PARAM` and `PUBLIC_ROBU_REFERRAL_ID`. Add an Amazon tag only after Amazon approves the site. The build decorates links only when both required values exist.
5. **Contact 20 relevant partners.** Send the `/earn/` partnership inquiry to robotics retailers, kit makers, clubs, and workshop organizers. Sell a labeled lesson or build-path placement, never a safety verdict.

## Revenue order

| Stage | Offer | What must be true |
| --- | --- | --- |
| Now | Paid BOM / wiring review | You agree scope, price, timeline, and payment method directly with the customer |
| After approval | Robu / Amazon referral links | The merchant issues an active account and tracking ID |
| This week | Printable build checklist or Forge starter pack | You create original material and connect a real payment link |
| Later | Sponsor placements and workshops | A partner signs a simple scope and the placement is labeled |

## Technical switch-on

```bash
PUBLIC_ROBU_REFERRAL_PARAM=approved_parameter
PUBLIC_ROBU_REFERRAL_ID=approved_id
PUBLIC_AMAZON_IN_TAG=approvedtag-21
PUBLIC_PAYMENT_LINK=https://your-real-payment-provider.example/your-link
PUBLIC_GITHUB_SPONSORS_URL=https://github.com/your-account
```

Set these as Cloudflare Pages **build** variables, not as secrets in Git. Rebuild and verify one catalog link in the generated HTML. If a value is blank, LBR intentionally leaves the direct source URL unchanged.

## Traffic plan for the next 14 days

- Publish three original build notes: `ESP32 + HC-SR04 safely`, `12-servo power sizing`, and `motor driver choice`.
- Turn each note into one short video, one screenshot of the Forge result, and one community post linking back to the relevant Forge preset.
- Ask every learner who uses a BOM review for permission to publish a redacted before/after case study.
- Track merchant clicks in the merchant dashboard and paid-review inquiries in a simple spreadsheet. Do not claim conversion or income until money is actually received.
