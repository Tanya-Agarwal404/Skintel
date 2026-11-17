<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep the public Skintel website at the index route and its interactive example in a separate component, so the editorial page and demonstration remain focused.
- Keep the sample preview on the index route browser-local and labeled as an example. Accounts use Firebase Auth. Skin profiles and consent are saved to the signed-in user's Firestore document (users/{uid}) behind firestore.rules, and results are saved there only when the user taps Save. Photos and label images are handled only in the Studio route behind its consent gate: they go to the server function only on an explicit analyse tap and are never persisted anywhere. Cycle dates stay out of every AI request. The post-signup tour runs only after a brand-new account is created, never after sign-in.
- Define visual styling through semantic tokens and reusable classes in src/styles.css, so the reference direction remains consistent throughout the site.
