import PageWrapper from '../../components/layout/PageWrapper';

function HelpAccessibility() {
  return (
    <PageWrapper title="Accessibility" showBack backPath="/help">
      <h1>Accessibility</h1>

      <div className="form-section">
        <h3 className="form-section-title">Keyboard navigation</h3>
        <ul>
          <li><kbd>Tab</kbd> moves to the next focusable element.</li>
          <li><kbd>Shift</kbd> + <kbd>Tab</kbd> moves back.</li>
          <li><kbd>Enter</kbd> or <kbd>Space</kbd> activates a button.</li>
          <li><kbd>Esc</kbd> closes dialogs and menus.</li>
        </ul>
      </div>

      <div className="form-section">
        <h3 className="form-section-title">Language</h3>
        <p>
          Use the language toggle in the header to switch between English and
          Sesotho. Your choice is remembered on this device.
        </p>
      </div>

      <div className="form-section">
        <h3 className="form-section-title">Screen readers</h3>
        <p>
          All buttons and inputs have accessible labels. Form errors are
          announced when focus enters the affected field.
        </p>
      </div>

      <div className="form-section">
        <h3 className="form-section-title">If something is not accessible</h3>
        <p>
          Email <a href="mailto:access@gov.ls">access@gov.ls</a> or visit the
          nearest office.
        </p>
      </div>
    </PageWrapper>
  );
}

export default HelpAccessibility;