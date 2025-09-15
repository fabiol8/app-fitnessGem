import React, { useState } from 'react';
import { Card, Input, Button, Modal } from '../../../components/ui';

const WeeklyMeasurementForm = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = {},
  user
}) => {
  const [formData, setFormData] = useState({
    weight: initialData.weight || '',
    bodyFat: initialData.bodyFat || '',
    chest: initialData.chest || '',
    waist: initialData.waist || '',
    hips: initialData.hips || '',
    arms: initialData.arms || '',
    neck: initialData.neck || '',
    ...initialData
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    // Weight is required
    if (!formData.weight || formData.weight <= 0) {
      newErrors.weight = 'Il peso è obbligatorio e deve essere maggiore di 0';
    }

    // Validate ranges
    if (formData.weight && (formData.weight < 30 || formData.weight > 300)) {
      newErrors.weight = 'Il peso deve essere tra 30 e 300 kg';
    }

    if (formData.bodyFat && (formData.bodyFat < 5 || formData.bodyFat > 50)) {
      newErrors.bodyFat = 'La percentuale di grasso deve essere tra 5 e 50%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const measurementData = {
        ...formData,
        weight: parseFloat(formData.weight),
        bodyFat: formData.bodyFat ? parseFloat(formData.bodyFat) : null,
        chest: formData.chest ? parseFloat(formData.chest) : null,
        waist: formData.waist ? parseFloat(formData.waist) : null,
        hips: formData.hips ? parseFloat(formData.hips) : null,
        arms: formData.arms ? parseFloat(formData.arms) : null,
        neck: formData.neck ? parseFloat(formData.neck) : null,
        date: new Date().toISOString().split('T')[0],
        timestamp: Date.now()
      };

      await onSubmit(measurementData);
      onClose();
    } catch (error) {
      console.error('Error submitting measurement:', error);
      setErrors({ submit: 'Errore nel salvare le misurazioni' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Misurazioni Settimanali"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Essential Measurements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Peso *"
            type="number"
            step="0.1"
            value={formData.weight}
            onChange={(e) => handleInputChange('weight', e.target.value)}
            unit="kg"
            error={errors.weight}
            required
            placeholder={user?.startWeight || ''}
          />

          <Input
            label="Grasso Corporeo"
            type="number"
            step="0.1"
            value={formData.bodyFat}
            onChange={(e) => handleInputChange('bodyFat', e.target.value)}
            unit="%"
            error={errors.bodyFat}
            placeholder={user?.startMeasurements?.bodyFat || ''}
          />
        </div>

        {/* Body Measurements */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Misurazioni Corporee (opzionali)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Petto"
              type="number"
              step="0.1"
              value={formData.chest}
              onChange={(e) => handleInputChange('chest', e.target.value)}
              unit="cm"
              placeholder={user?.startMeasurements?.chest || ''}
            />

            <Input
              label="Vita"
              type="number"
              step="0.1"
              value={formData.waist}
              onChange={(e) => handleInputChange('waist', e.target.value)}
              unit="cm"
              placeholder={user?.startMeasurements?.waist || ''}
            />

            <Input
              label="Fianchi"
              type="number"
              step="0.1"
              value={formData.hips}
              onChange={(e) => handleInputChange('hips', e.target.value)}
              unit="cm"
              placeholder={user?.startMeasurements?.hips || ''}
            />

            <Input
              label="Braccia"
              type="number"
              step="0.1"
              value={formData.arms}
              onChange={(e) => handleInputChange('arms', e.target.value)}
              unit="cm"
              placeholder={user?.startMeasurements?.arms || ''}
            />

            <Input
              label="Collo"
              type="number"
              step="0.1"
              value={formData.neck}
              onChange={(e) => handleInputChange('neck', e.target.value)}
              unit="cm"
              placeholder={user?.startMeasurements?.neck || ''}
            />
          </div>
        </div>

        {/* Error Message */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
            {errors.submit}
          </div>
        )}

        {/* Form Actions */}
        <div className="flex space-x-3 pt-4">
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? 'Salvando...' : 'Salva Misurazioni'}
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1"
          >
            Annulla
          </Button>
        </div>

        <p className="text-xs text-gray-500 text-center">
          * Campo obbligatorio. Le altre misurazioni sono opzionali ma aiutano a tracciare meglio i progressi.
        </p>
      </form>
    </Modal>
  );
};

export default WeeklyMeasurementForm;