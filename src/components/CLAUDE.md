# Project Rules

## TypeScript

- Prefer interfaces over type aliases.
- Use strict mode.

## React

- Functional components only.
- Use hooks.
- Use Tailwind.
- Don't use ternary if-statements in jsx elements expressions. So don't use:
    <>{a > b ? <span>Hello</span> : <span>world</span>}</>
    But use:
    <>
      { a > b && <span>Hello</span>}
      { a <= b && <span>World</span>}
    </>

## Backend

- Django REST Framework.
- JWT authentication.

## General

- Explain why before changing code.
- Keep functions under 40 lines.
