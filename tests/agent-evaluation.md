# Agent discoverability evaluation

The [fixture](fixtures/agent-discoverability.json) contains 12 traveler questions, allowed sources for each mode, and grading notes. Use the three modes to compare what the same model can learn from HTML alone, from the index and the first-party resources it links to, and from the full reference alone.

## Run the benchmark

1. Run `npm run build` and use a local instance of this revision, or pick a deployed revision and record its commit and test date. For local use, run `npm run dev -- --host 127.0.0.1` and remap the fixture's site origin to the loopback address in your fetch tool. Keep citations in the answers as canonical public URLs. To make a deployed run reproducible, save the responses supplied to the model.
2. Use the same model, system instructions, tool behavior, temperature and time limits across modes. Disable external web search and WebMCP. For HTML, provide page text and navigable links from the same extraction method each time, including language alternatives. Use the input unchanged for Markdown and text. Count the seed page as a fetch.
3. Start a fresh context for each question and mode. Give the model only the question, the mode's seed URL, and its permitted resource scope. Let it decide which allowed resources to fetch. Keep grading notes and suggested source paths out of the prompt.
4. Use a consistent instruction such as “Answer in English using only the permitted site resources. Cite the pages you used. State when a fact is uncertain or a current quote is unavailable.” Collect all 36 responses, along with the requested URLs and resource measurements.
5. Grade against the fixture. In modes A and B, evidence for an answer may span multiple resources. In mode C, the cited evidence must come from `/llms-full.txt`. In mode B, the index is a sufficient citation only when its body supports the claim. A booking or map link can be offered as a next step without visiting it.

## Score each response

| Metric             | What to record                                                                                                                                                                  |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Factual accuracy   | **2** for all applicable expected facts with no factual error, **1** for a correct main answer with missing expected detail, **0** for a wrong or missing main answer.          |
| Unsupported claims | List and count distinct factual assertions unsupported by the permitted evidence. Include invented prices or availability and an unqualified bedroom count.                     |
| Omissions          | List and count missed expected facts. Examples in the fixture are alternatives unless the expectation specifies a minimum or requires a named fact.                             |
| Source attribution | **2** when citations cover the substantive claims and use accessed, allowed resources, **1** for partial attribution, **0** for missing or invalid citations.                   |
| Resource usage     | Count fetches, including retries, and bytes delivered to the model. Record input and output tokens and elapsed time if the runner reports them. Use null for unmeasured values. |

Record one row per answer with the revision, mode, question ID, model, answer, accessed URLs, both scores, the two fact lists and the usage measurements. Sum accuracy and attribution separately out of 24 per mode. Report unsupported-claim and omission totals, plus median fetch count and median bytes per question. The external listings can be updated independently. If the four-person cabin's layout is confirmed and published, update the fixture before benchmarking the new revision.

The repository has no configured model runner. The automated Node tests exercise the publishing outputs and WebMCP callbacks. This benchmark requires an external model invocation.
