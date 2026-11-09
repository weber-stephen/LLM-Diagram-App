# Limited collaborative prompt check

These prompts are a manual smoke check, not a comprehensive AI evaluation. No paid runs were made for this repository update. Record the outcome after a run with an authorized key; do not infer usefulness from unit tests.

| Prompt and follow-up | Model | Date | Reply kind | Valid proposal? | Rendered? | Useful? | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Ask for login with failed credentials and lockout; then request a retry path | Luna | Not run | Not measured | Not measured | Not measured | Not measured | |
| Ask for an order sequence with payment failure; answer any clarification | Luna | Not run | Not measured | Not measured | Not measured | Not measured | |
| Ask for browser, load balancer, app, cache, and database; ask to explain a missing dependency | Luna | Not run | Not measured | Not measured | Not measured | Not measured | |
| Repeat the three conversations | Sol | Not run | Not measured | Not measured | Not measured | Not measured | |

For each run, note whether the assistant asked a useful question, whether the proposal survived validation, whether it rendered, and whether an edit preserved unaffected relationships. Record the actual response model and prompt version shown in the UI. Approval is a user action and should not trigger an OpenAI request.
