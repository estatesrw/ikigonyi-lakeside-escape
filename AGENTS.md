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

## Account security
- Keep password changes in the role-independent authenticated account page so all signed-in users can update their own credentials.
- Share password validation and form logic; signed-in changes send the current password, while public recovery changes require a valid recovery link and omit it.
