# Inspiria Designs — Blog Production Workflow

This is a manual workflow. You kick off each step yourself — nothing runs automatically. The split is simple: **Gemini researches, Claude writes.**

---

## Why This Split

- **Gemini** has real-time web access and costs nothing. Use it for the work Claude can't do well: check what's already ranking, pull current stats, and map the competitive landscape.
- **Claude** writes the actual article. Writing from a solid research brief produces better results than having Claude guess at what's ranking or having Gemini draft something Claude then has to fight to rewrite.

---

## Step 1 — Pick Your Topic & Keywords

Decide what you're writing and who it's for. Reference `inspiria-keywords.md` and pick:
- 1 primary keyword
- 2–4 secondary keywords

If you're unsure, run Step 2A first to validate before committing.

---

## Step 2 — Gemini Research

Open Gemini and run whichever of these prompts you need. Copy the output — you'll paste it into Claude in Step 3. You don't need to run all four every time; use judgment based on how well you already know the topic.

### 2A — Optional: Keyword Validation
*Use this if you want to validate or expand your keyword choice.*

```
I'm writing a blog post for a Canadian web design agency targeting [lawyers / real estate agents / therapists / dentists / accountants / financial advisors / chiropractors].

The topic is: [TOPIC]
My target primary keyword is: [KEYWORD]

Search Google and tell me:
1. What types of posts are currently ranking for this keyword (listicles, guides, comparisons)?
2. What subtopics or questions come up most in the search results and "People Also Ask" section?
3. Are there any stronger or more specific long-tail variations of this keyword I should consider?
4. Approximate search intent — is the reader looking for information, a service, or a comparison?
```

---

### 2B — SERP & Competitor Analysis
*Understand what's already ranking so Claude can write something better.*

```
Search for "[PRIMARY KEYWORD]" and review the top 5 results.

For each result, summarize:
- The title and main angle
- The key points or sections covered
- Any gaps, weaknesses, or things the article doesn't address well

Then give me:
- A list of points that appear in multiple top results (table stakes — must cover)
- A list of gaps or underserved angles I could use to differentiate
```

---

### 2C — Facts, Stats & Supporting Data
*Give Claude real data to cite so the article has authority.*

```
I'm writing an article on: [TOPIC]
Target audience: [solo lawyers / real estate agents / therapists / dentists / accountants / financial advisors / chiropractors] in Canada

Find me:
- 3–5 relevant statistics or data points I can cite (with sources)
- Any relevant Canadian-specific data if available
- Any recent (last 2 years) studies, surveys, or reports on this topic
```

---

### 2D — Content Outline
*Optional. Have Gemini draft a skeleton, which Claude will use as a loose reference.*

```
Based on your research above, suggest a blog post outline for the topic: [TOPIC]

Format:
- Suggested H1 title (include the primary keyword: [KEYWORD])
- 3–5 H2 section headings
- 2–3 bullet points under each heading indicating what to cover
- Suggested CTA for the conclusion

Keep it lean — this is a research skeleton, not a draft.
```

---

## Step 3 — Claude Writing Brief

Load these files first:
- `inspiria-content-context.md` — brand voice, audience, format standards
- `inspiria-keywords.md` — keyword bank for reference

Then paste this prompt, filling in the Gemini research output:

```
You are writing a blog post for Inspiria Designs (inspiriadigital.com), a Canadian web design agency.

Load the content context and follow the brand voice, tone, and format standards defined there.

--- ARTICLE BRIEF ---
Topic: [TOPIC TITLE]
Focus: [1–2 sentences on the specific angle]
Target reader: [solo lawyers / real estate agents / therapists / dentists / accountants / financial advisors / chiropractors] in Canada, ~$75,000/year income, wants to grow their practice online
Primary keyword: [KEYWORD]
Secondary keywords: [KW1], [KW2], [KW3]
Word count: ~1,000 words

--- GEMINI RESEARCH OUTPUT ---
[Paste Gemini's full output from Steps 2A–2D here]

--- INSTRUCTIONS ---
Write the full blog post now. Use the research above to inform the content — cite specific stats where provided. Do not copy Gemini's outline structure rigidly; write what flows best for the reader. Follow the format standards: hook intro, 3–5 H2 sections, conclusion with CTA pointing to Inspiria Designs.
```

---

## Step 4 — Review & Publish Checklist

Before publishing, confirm:

- [ ] Primary keyword appears in: title, first paragraph, at least one H2
- [ ] Secondary keywords appear naturally (not forced)
- [ ] Canada / Canadian context mentioned at least once
- [ ] Every section is actionable — reader learns something they can do
- [ ] CTA is present in the conclusion
- [ ] No jargon a non-technical professional wouldn't understand
- [ ] Word count is ~1,000 (can be 900–1,100)
- [ ] Meta description written (150–160 characters, includes primary keyword)

---

<!-- ## Planned Posts

| Status | Vertical | Title | Primary Keyword |
|--------|----------|-------|-----------------|
| 🔲 | Lawyers | Convert Visitors into Clients: The Essential Guide to Law Firm Website Design | how to get more clients as a lawyer |
| 🔲 | Real Estate | Ditch Zillow: How Your Own Website Makes You a Real Estate Authority | why realtors need their own website |
| 🔲 | Therapists | The First Impression: Why Your Therapy Website Needs to Build Trust | website design for mental health professionals |
| 🔲 | Cross-vertical | 5 Signs Your Website is Driving Clients Away (And How to Fix It) | how to know if your website needs a redesign |
| 🔲 | Dentists | *(topic TBD)* | how to get more dental patients |
| 🔲 | Accountants | *(topic TBD)* | how to get more accounting clients |
| 🔲 | Financial Advisors | *(topic TBD)* | website design for financial advisors |
| 🔲 | Chiropractors | *(topic TBD)* | how to get more chiropractic patients |

Update status: 🔲 Not started → 🔄 In progress → ✅ Published -->
