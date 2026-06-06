import { hashed } from "../modules/hasher.js";
import { html } from "../modules/html.js";
import { appVersion } from "../modules/version.js";
export const Layout = (content) => html`
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="description" content="A boring todo app" />

      <!-- Scripts -->
      <script src="${hashed(`/static/js/fetch-it.js`)}" type="module"></script>
      <script
        src="${hashed(`/static/js/preload-it.js`)}"
        type="module"
      ></script>
      <script src="${hashed(`/static/js/scoped-css.js`)}"></script>
      <script
        type="module"
        src="${hashed(`/static/js/errors.js`)}"
        defer
      ></script>

      <!-- Styles -->
      <link rel="stylesheet" href="${hashed(`/static/css/reset.css`)}" />
      <link rel="stylesheet" href="${hashed(`/static/css/app.css`)}" />
      <link rel="apple-touch-icon" href="${hashed(`/static/favicon.png`)}" />
      <link rel="icon" href="${hashed(`/static/favicon.png`)}" />

      <title>Todos</title>
    </head>

    <body data-appversion="${appVersion}">
      <style>
        me {
          font-family: var(--font-sans);
        }
      </style>
      <header>
        <style>
          me {
            padding: var(--size-8);
            margin: 0 auto;
            max-width: var(--width-lg);
          }
          @media sm {
            me {
              font-size: var(--scale-2);
            }
          }
        </style>
        <a href="/">boring.todos</a>
      </header>
      ${content}

      <!-- Placeholder for alerts -->
      <div id="alert-placeholder"></div>
      <footer>
        <style>
          me {
            text-align: center;
            max-width: var(--width-lg);
            margin: 0 auto;
            padding: var(--size-8) 0;
            color: var(--color-grey-600);
          }
        </style>
        © ${new Date().getFullYear()}
        <a href="https://sizovs.net">Eduard Sizov</a>. All Rights Reserved.
      </footer>
    </body>
  </html>
`;
