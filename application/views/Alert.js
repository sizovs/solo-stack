import { html } from "../modules/html.js";

export const Alert = ({ link, lead, follow }) => html`
  <div id="alert-placeholder">
    <div data-js-alert role="alert">
      <style>
        me {
          padding: var(--size-2);
          margin: 0 auto;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          background-color: var(--color-red-600);
        }
        me a {
          color: var(--color-white);
          text-decoration: none;
        }
        me svg {
          cursor: pointer;
          float: right;
          color: var(--color-white);
          height: var(--size-4);
          width: var(--size-4);
        }
      </style>
      <a href="${link ?? ""}"> <strong>${lead}</strong> | ${follow}</a>
      <svg
        data-js-close
        data-testid="close"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>

      <script>
        (() => {
          const script = document.currentScript;
          const alert = script.closest("[data-js-alert]");

          alert
            .querySelector("[data-js-close]")
            ?.addEventListener("click", () => {
              alert.remove();
            });

          setTimeout(() => {
            alert.remove();
          }, 5000);
        })();
      </script>
    </div>
  </div>
`;
