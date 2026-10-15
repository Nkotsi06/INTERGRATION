import Button from './Button';

function FormActions({
  primaryLabel = 'Save',
  onPrimary,
  primaryLoading = false,
  primaryDisabled = false,
  primaryVariant = 'primary',
  secondaryLabel = 'Cancel',
  onSecondary,
  destructiveLabel,
  onDestructive,
  align = 'right',
}) {
  return (
    <div className={`form-actions ${align === 'between' ? 'form-actions-between' : ''}`}>
      {destructiveLabel && onDestructive && (
        <Button
          type="button"
          variant="danger"
          onClick={onDestructive}
          className="form-actions-destructive"
        >
          {destructiveLabel}
        </Button>
      )}

      <div className="form-actions-primary-group">
        {secondaryLabel && onSecondary && (
          <Button type="button" variant="secondary" onClick={onSecondary}>
            {secondaryLabel}
          </Button>
        )}

        <Button
          type="button"
          variant={primaryVariant}
          onClick={onPrimary}
          loading={primaryLoading}
          disabled={primaryLoading || primaryDisabled}
        >
          {primaryLabel}
        </Button>
      </div>
    </div>
  );
}

export default FormActions;