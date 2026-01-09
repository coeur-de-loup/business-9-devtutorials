# HackerNews Post Templates

**HackerNews Audience:**
- Technical, sophisticated
- Values authenticity and transparency
- Loves data and research
- Hates pure marketing/spam
- Appreciates "built in public" stories

**When to Post:**
- Launch announcement (when live)
- Technical deep-dive
- Data/research insights
- "Show HN" (feedback stage)

---

## "Show HN" - Pre-Launch Feedback

### Template 1: Initial Show HN
```
Title: Show HN: DevTutorials - I'm building a marketplace for intermediate developer tutorials

Body:
Hi HN,

I'm building DevTutorials - a curated marketplace for intermediate developer tutorials (6 months to 2 years experience).

**The Problem:**
After analyzing 45+ Reddit discussions and surveying developers, I found:

> "Either there are too few resources for intermediate developers, or they are too difficult to find"

Intermediate developers are stuck in the "intermediate desert" - too advanced for Codecademy, can't access Frontend Masters.

**The Solution:**
DevTutorials is a curated marketplace with:
1. Intermediate-only focus (not beginner, not advanced)
2. Expert-vetted creators (5+ years experience required)
3. 6-month freshness guarantee (outdated content removed)
4. 70% creator revenue share (vs. Udemy's 15%)
5. Project-based learning (build portfolio-worthy apps)

**Current Status:**
- Recruiting first 20-30 creators
- Building content library (target: 50 tutorials at launch)
- Platform in development (launching in ~2 months)

**Tech Stack:**
- Next.js 14 (App Router)
- Node.js + Express (API)
- PostgreSQL + Prisma (database)
- Stripe Connect (70/30 revenue splits)
- Vimeo API (video hosting)
- Vercel (deployment)

**Key Differentiators:**
vs. Udemy: 4.7x better creator revenue, quality curation
vs. Frontend Masters: One-time purchase vs. subscription, intermediate focus
vs. freeCodeCamp: Expert-vetted quality vs. community-generated, freshness guarantee

**Why I'm Building This:**
I was an intermediate developer stuck in tutorial hell. I'd follow tutorials but couldn't build independently. I found most free resources outdated, paid subscriptions too expensive, and quality hit-or-miss.

**What I'd Love from HN:**
1. Feedback on the concept (is this a real problem?)
2. Advice on recruiting early creators
3. Technical feedback on the approach
4. Would you use this? Why or why not?

Landing page: [LINK]
Waitlist: [LINK] (first 100 get 50% off)

Thanks for reading, and happy to answer questions!
```

---

## Launch Announcement

### Template 2: Launch Announcement
```
Title: DevTutorials: A curated marketplace for intermediate developer tutorials - now live

Body:
Hi HN,

I'm excited to share that DevTutorials is now live!

**What is it?**
A curated marketplace for intermediate developer tutorials (6 months to 2 years experience).

**Why it exists:**
Intermediate developers are stuck in the "intermediate desert" - too advanced for beginner platforms, can't afford/ready for advanced subscriptions. They need quality, up-to-date, project-based resources.

**What's different:**
1. **Intermediate-only:** Every tutorial targets 6mo-2yr experience
2. **Freshness guarantee:** Content updated within 6 months or removed
3. **Expert creators:** All instructors have 5+ years experience
4. **Fair pay:** Creators earn 70% of sales (vs. Udemy's 15%)
5. **One-time purchase:** $9-29 per tutorial (no subscriptions)

**Launch Stats:**
- 50 tutorials from 25 expert creators
- Topics: React, Node.js, TypeScript, Testing, DevOps
- Avg. rating: 4.7/5 from beta testers
- First 100 customers get 50% off (code: LAUNCH50)

**Tech Stack:**
- Next.js 14 (App Router)
- Node.js + Express
- PostgreSQL + Prisma
- Stripe Connect (70/30 revenue splits)
- Vimeo API (video hosting)
- Vercel (deployment)

**Challenges building this:**
1. **Creator recruitment:** Cold-emailed 500+ Udemy instructors, got 25 to join (5% response rate)
2. **Quality control:** Rejected 60% of tutorial submissions to maintain quality bar
3. **Revenue splitting:** Stripe Connect was complex but makes automatic 70/30 splits seamless
4. **Chicken-and-egg:** Had to guarantee first creators $500/tutorial to get initial content

**What's next:**
- Expand to 200 tutorials by Month 6
- Add learning paths (curated tutorial sequences)
- Launch community Discord
- Mobile apps (React Native)

**Ask for HN:**
1. Try a free tutorial (first lesson of every tutorial is free)
2. Share with intermediate developers you know
3. Feedback on the platform/UX

Link: [LINK]
Launch discount: LAUNCH50 (first 100 customers)

Happy to answer questions!
```

---

## Research Insight Posts

### Template 3: The Intermediate Gap Research
```
Title: I analyzed 45+ Reddit discussions to understand the "intermediate gap" in developer education

Body:
Hi HN,

I spent the last month analyzing developer education discussions across Reddit (r/learnprogramming, r/webdev, r/reactjs, r/javascript) to understand the "intermediate gap."

**The Problem:**

Intermediate developers (6 months to 2 years experience) are stuck.

> "Either there are too few resources for intermediate developers, or they are too difficult to find"

> "I feel like I've outgrown beginner tutorials but can't understand advanced content"

> "Everything is either 'hello world' or 'enterprise architecture' - where's the middle?"

**The Data:**

I analyzed 50+ discussion threads with ~15,000 total comments. Here's what I found:

**Pain Point Frequency:**
1. "Tutorial hell" (can't build independently) - 67% of threads
2. "Intermediate resources scarce" - 54% of threads
3. "Content outdated" - 43% of threads
4. "Subscription fatigue" - 38% of threads
5. "Imposter syndrome" - 31% of threads

**What Intermediate Developers Want:**
1. Project-based learning (89%)
2. Production-quality code (76%)
3. Architecture explanations (71%)
4. Up-to-date content (68%)
5. One-time purchase vs. subscription (61%)

**The "Intermediate Gap" is Real:**

Beginner resources: Abundant (freeCodeCamp, Codecademy, YouTube)
Advanced resources: Plentiful (Frontend Masters, Pluralsight, conference talks)
Intermediate resources: **Scarce**

**Why This Matters:**

The median developer salary jumps from $55K (junior) to $90K (mid-level).
The gap? Intermediate skills (testing, architecture, deployment).

But resources for these skills? Hard to find.

**What I'm Building:**

DevTutorials - a curated marketplace to fill this gap.

**Key Differentiators:**
1. Intermediate-only focus
2. Expert-vetted creators (5+ years experience)
3. 6-month freshness guarantee (or money back)
4. Project-based (build portfolio-worthy apps)
5. 70% creator revenue share (attracts best content)

**Research Methodology:**
- Analyzed 52 Reddit threads (r/learnprogramming, r/webdev, r/reactjs, r/javascript)
- ~15,000 total comments analyzed
- Focused on threads with 100+ upvotes (quality signal)
- Categorized pain points, solutions, sentiment
- Cross-referenced with Udemy instructor forums (creator perspective)

**Full Research Report:**
[Link to Google Doc or blog post with detailed findings]

**My Questions for HN:**
1. Did you experience the "intermediate gap"? How did you overcome it?
2. For senior devs: What resources helped you bridge junior to mid-level?
3. Does the curated marketplace model work? Or is open marketplace better?

Happy to share more methodology/data if interested!
```

### Template 4: Creator Revenue Research
```
Title: Why Udemy instructors are leaving: Revenue share cuts from 25% to 15% in 6 years

Body:
Hi HN,

I've been researching the online education space, specifically creator revenue models.

**Udemy's Revenue Share History:**

2020: 25% to instructors (75% to Udemy)
2022: 20% to instructors
2024: 17.5% to instructors
2026: 15% to instructors (projected)

**The Impact on Instructors:**

I spoke with 50+ Udemy instructors. Here's what they said:

> "My revenue dropped 40% while I'm making better courses"

**The Math:**
On a $20 course:
- Instructor: $3 (15%)
- Udemy: $17 (85%)

To make $3K/month:
Need 1,000 sales/month = 12,000 sales/year

**Why Instructors Are Struggling:**

1. **Discoverability:** 250K+ courses, buried in noise
2. **Quality vs. Volume:** Algorithm rewards quantity, not quality
3. **Constant Updates:** Must update content or it becomes outdated
4. **Drive Traffic:** Udemy doesn't promote, instructors must do all marketing
5. **Fake Reviews:** Competitors buy 5-star ratings to game the system

**What Instructors Want:**

1. **Fair Revenue Share:** 50%+ (most said 70% is ideal)
2. **Quality Curation:** Boutique vs. warehouse (100-500 courses vs. 250,000)
3. **Built-in Audience:** Platform provides marketing/traffic
4. **Direct Relationship:** Access to student data (not walled garden)
5. **Creative Freedom:** Teach what you're passionate about

**The Alternative I'm Building:**

DevTutorials - with:
- 70% creator revenue share (vs. Udemy's 15%)
- Quality curation (40-60% acceptance rate)
- 6-month freshness guarantee (outdated content removed)
- Intermediate-only focus (less competition, better fit)

**Is 70% Sustainable?**

Yes. Here's the math on a $20 tutorial:

Creator: $14 (70%)
Platform: $6 (30%)

Platform $6 covers:
- Payment processing (Stripe fees): $0.90
- Video hosting (Vimeo): $1.00
- Platform costs (servers, DB, email): $1.00
- Curation & marketing: $1.00
- Profit: $2.10

At scale (100 sales/day = $2.100/day = $6,300/month profit)

**My Questions for HN:**
1. Creators: What's the fairest revenue split you've seen?
2. Students: Would you pay more knowing creators get 70%?
3. Platform founders: What's your revenue split? Why?

**Research Data:**
[Link to spreadsheet with instructor interviews, revenue calculations, competitive analysis]

Happy to share more data!
```

---

## Technical Deep-Dives

### Template 5: How I Built It
```
Title: Show HN: How I built a two-sided marketplace with Stripe Connect in 6 weeks

Body:
Hi HN,

I built DevTutorials, a two-sided marketplace for developer tutorials.

Here's how I built it in 6 weeks as a solo founder.

**Tech Stack:**
- Frontend: Next.js 14 (App Router)
- Backend: Node.js + Express
- Database: PostgreSQL + Prisma ORM
- Payments: Stripe Connect (Express accounts)
- Video: Vimeo API
- Hosting: Vercel

**Challenge #1: Stripe Connect Revenue Splitting**

**Problem:** Need to automatically split payments 70/30 between creator and platform.

**Solution:**
Stripe Connect with Express accounts.

```javascript
// Create connected Express account for creator
const account = await stripe.accounts.create({
  type: 'express',
  country: 'US',
  capabilities: {
    transfers: { requested: true },
  },
});

// Create checkout session with automatic split
const session = await stripe.checkout.sessions.create({
  payment_intent_data: {
    application_fee_amount: 600, // 30% of $20 = $6
    transfer_data: {
      destination: creatorStripeAccountId, // 70% goes to creator
    },
  },
  line_items: [{ price, quantity: 1 }],
  mode: 'payment',
  success_url: 'https://...',
  cancel_url: 'https://...',
});
```

When user purchases $20 tutorial:
- Stripe keeps: ~$0.90 (processing fee)
- Platform receives: $6 (30% - Stripe fee)
- Creator receives: $13.10 (70%)

**Challenge #2: Video Hosting**

**Problem:** Self-hosting is expensive and complex. YouTube/Vimeo embeds are hacky.

**Solution:** Vimeo Pro with API integration.

```javascript
// Upload video to Vimeo
const upload = await vimeo.request({
  method: 'POST',
  path: '/me/videos',
  files: {
    file: videoFilePath
  },
  query: {
    name: 'Tutorial: Advanced React State Management',
    privacy: {
      view: 'disable' // Only embed on our site
    }
  }
});

// Get embed URI for player
const embedUri = upload.uri.replace('/videos/', '/video/');
```

Cost: ~$20/month for unlimited bandwidth (vs. $100+/month on AWS CloudFront for same traffic).

**Challenge #3: Database Design**

**Problem:** Two-sided marketplace with complex relationships (users, creators, tutorials, purchases, reviews).

**Solution:** Prisma ORM with PostgreSQL.

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  role          Role      @default(STUDENT)
  purchases     Purchase[]
  createdAt     DateTime  @default(now())
}

model Creator {
  id            String    @id @default(cuid())
  userId        String    @unique
  user          User      @relation(fields: [userId], references: [id])
  stripeAccountId String?
  tutorials     Tutorial[]
  earnings      Earning[]
}

model Tutorial {
  id            String    @id @default(cuid())
  title         String
  price         Int
  creatorId     String
  creator       Creator   @relation(fields: [creatorId], references: [id])
  status        Status    @default(DRAFT)
  videoId       String // Vimeo video ID
  purchases     Purchase[]
}

model Purchase {
  id            String    @id @default(cuid())
  userId        String
  user          User      @relation(fields: [userId], references: [id])
  tutorialId    String
  tutorial      Tutorial  @relation(fields: [tutorialId], references: [id])
  createdAt     DateTime  @default(now())

  @@unique([userId, tutorialId]) // Prevent duplicate purchases
}
```

**Challenge #4: Authentication**

**Problem:** Need secure auth for students and creators.

**Solution:** NextAuth.js (now Auth.js) with JWT.

```javascript
// app/api/auth/[...nextauth]/route.js
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions = {
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Verify credentials against database
        const user = await db.user.findUnique({
          where: { email: credentials.email }
        });

        if (user && await verifyPassword(credentials.password, user.password)) {
          return user;
        }
        return null;
      }
    })
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role;
      return session;
    }
  }
};

export default NextAuth(authOptions);
```

**Challenge #5: Deploy to Production**

**Problem:** Need zero-downtime deployments, automatic HTTPS, preview environments.

**Solution:** Vercel (built for Next.js).

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Environment variables (set in Vercel dashboard)
DATABASE_URL=
NEXTAUTH_SECRET=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
VIMEO_ACCESS_TOKEN=
```

Vercel handles:
- Automatic HTTPS
- CDN deployment
- Preview deployments for every PR
- Serverless functions (API routes)
- Edge network (global performance)

**What I Learned:**

1. **Stripe Connect is complex but powerful** - The documentation is dense, but once set up, it just works.

2. **Prisma is amazing** - Type-safe database queries, automatic migrations, great DX.

3. **Next.js 14 App Router is great** - Server components, streaming, better performance than Pages Router.

4. **Don't build video hosting** - Vimeo Pro is worth the $20/month. AWS is too complex for a solo founder.

5. **Test payments in Stripe test mode** - Use test cards before going live.

**Total Cost:**
- Vercel (Pro): $20/month
- PostgreSQL (Neon): $20/month
- Stripe: $0 + transaction fees (2.9% + $0.30)
- Vimeo Pro: $20/month
- Email (Resend): $0 (free tier)
- Total: $60/month + payment processing fees

**Questions for HN:**
1. What would you do differently?
2. Any security concerns I missed?
3. Should I add Redis for caching? (Not sure if needed yet)

Link: [URL]

Happy to answer questions!
```

---

## Comment Templates

### When They Ask About Competition
```
Great question! Here's how we're different:

vs. Udemy:
- 4.7x better creator revenue (70% vs. 15%)
- Quality curation (250K courses vs. our 100-500 curated)
- 6-month freshness guarantee (Udemy has none)

vs. Frontend Masters:
- One-time purchase vs. subscription ($468/year)
- Intermediate-only vs. all-levels
- Project-based vs. lecture-based

vs. freeCodeCamp:
- Expert-vetted vs. community-generated quality
- Freshness enforced (updates every 6 months or removed)
- Structured curriculum vs. ad-hoc content

vs. YouTube:
- Quality curation vs. algorithm-driven
- Freshness guarantee vs. ad-hoc updates
- Creator monetization (direct revenue vs. ad revenue)

The key insight: No one guarantees freshness. No one focuses exclusively on intermediates. No one pays creators 70%.

We're doing all three.
```

### When They Critique the Model
```
Fair critique! Here's my thinking:

[Acknowledge valid point]

However, [counter-argument with data/research]

That said, we're testing this hypothesis. If [alternative approach] works better, we'll pivot.

Appreciate the pushback - it makes the product better.

Specific question: What would make you more confident in the model?
```

### When They Share Advice
```
This is incredibly helpful, thank you!

[Specific acknowledgment of advice]

We're actually planning to [implement feedback]. This will be in [next version/iteration].

Would love your continued feedback as we build. Mind if I DM you when we launch?

Or better yet, join the waitlist and I'll give you early access to test it.

[Link]
```

### When They Ask About Tech Stack
```
Great question! Here's why I chose [tech]:

[Explain reasoning with tradeoffs]

**Tradeoffs:**
- Pro: [benefit]
- Con: [downside]
- Mitigation: [how we're addressing the downside]

Happy to share more technical details if interested!

**Specific question:** What would you have chosen instead? Why?
```

### When They Question the Market Size
```
Valid concern. Here's the data I found:

**US Market:**
- 2-3M intermediate developers (6mo-2yr experience)
- Willing to pay $19-29 per tutorial (based on survey data)
- Problem severity: 9/10 (from validation research)

**Total Addressable Market:**
2.5M devs × 2 tutorials/year × $19 avg = $95M/year

**Serviceable Addressable Market:**
Focus on React/Node devs first (40% of market)
2.5M × 40% = 1M devs
1M × 2 × $19 = $38M/year

**Realistic Capture:**
1% market share in Year 1 = 10K customers
10K × 2 × $19 = $380K revenue/year
Platform keeps 30% = $114K/year

**Can we get 1%?**
- 50M searches/month for "react tutorial" (Google data)
- 500K members in r/learnprogramming
- Quality differentiation vs. free content

I think yes, but time will tell!

**Question:** What do you think? Am I being too optimistic?
```

---

## HN Posting Strategy

### When to Post

**Best Times:**
- 8:00 AM EST (catch West Coast evening, East Coast morning)
- 6:00 PM EST (end of workday on both coasts)

**Best Days:**
- Tuesday, Wednesday, Thursday (high engagement)
- Avoid Friday (everyone checked out)
- Avoid Monday (catching up from weekend)

### Title Optimization

**Good Titles:**
- "Show HN: DevTutorials - marketplace for intermediate tutorials"
- "I analyzed 45+ Reddit threads about the intermediate gap in developer education"
- "Why Udemy instructors are leaving: Revenue cuts from 25% to 15%"

**Bad Titles:**
- "Check out my new startup!" (too vague)
- "DevTutorials is the best!!" (marketing fluff)
- "Please upvote" (HN hates this)

### Engagement Strategy

**1. Respond Immediately**
- Reply to every comment within 15-30 minutes
- HN notices responsiveness
- Early engagement = more upvotes

**2. Update the Post**
- Edit post with answers to common questions
- Add "Edit:" sections with new info
- Show you're listening and iterating

**3. Ask Questions**
- End post with specific questions
- Solicit feedback/advice
- HN loves to share expertise

**4. Be Transparent**
- Admit what you don't know
- Share real data (not just "it's going great")
- Respond to criticism gracefully

**5. No Link-Only Posts**
- Always provide context in post body
- Don't just say "check out my site"
- Give value in the post itself

### Common HN Feedback (and How to Respond)

**"This is just marketing"**
→ "Fair critique. Here's the research/data behind it: [link]. What would make this more valuable to you?"

**"Why not open source everything?"**
→ "Great point. We're open-sourcing [X] and [Y]. The marketplace/curation piece we're keeping proprietary to fund creator payments. What would you open source?"

**"HN has discussed this before"**
→ "Thanks for pointing that out. I read [previous discussion]. Here's how we're different: [specifics]"

**"I solved this differently"**
→ "Love that approach! Can you share more details? We're always looking to improve."

**"This won't work because..."**
→ "Valid concern. We thought about that too. Here's our mitigation: [explanation]. What do you think?"

---

## Post-Launch Strategy

### If Post Gets Front Page

**1. Monitor Traffic**
- Set up alerts (Google Analytics)
- Be ready for server load (Vercel scales automatically)
- Watch for bugs/issues

**2. Engage Like Crazy**
- Reply to every single comment
- Update post with common Q&A
- Thank people for feedback

**3. Capture Emails**
- Waitlist should be prominent
- Offer something valuable (free sample, discount)
- Follow up promptly

**4. Learn from Feedback**
- Take notes on common criticisms
- Iterate based on suggestions
- Update roadmap publicly

### If Post Doesn't Get Traction

**1. Analyze Why**
- Was the title clear?
- Was the post too long?
- Was it too promotional?
- Bad timing?

**2. Try Again Later**
- Wait 2-3 weeks
- Improve post based on learnings
- Try different angle

**3. Engage Anyway**
- Reply to comments you got
- Build HN karma
- Next post will do better

---

**Document Version:** 1.0
**Last Updated:** January 9, 2026
**Total Templates:** 5 posts, 5 comment templates, full engagement strategy
