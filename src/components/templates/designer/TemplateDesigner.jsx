import React, { useState } from 'react';
import DesignerToolbar from './DesignerToolbar.jsx';
import FieldPalette from './FieldPalette.jsx';
import TemplateCanvas from './TemplateCanvas.jsx';
import PropertiesPanel from './PropertiesPanel.jsx';
import {
  TEMPLATE_DESIGNER_MODES,
  DEFAULT_DESIGNER_ZOOM,
} from '../../../constants/template.js';

export const TemplateDesigner = ({
  formData,
  onPhotoChange,
  onFieldChange,
  onAddField,
  onRemoveField,
}) => {
  const [mode, setMode] = useState(TEMPLATE_DESIGNER_MODES.DESIGN);
  const [zoom, setZoom] = useState(DEFAULT_DESIGNER_ZOOM);
  const [selectedElement, setSelectedElement] = useState(null);

  const handleUpdatePhoto = (updatedPhoto) => {
    onPhotoChange('photo', updatedPhoto);
  };

  const handleUpdateField = (index, prop, value) => {
    onFieldChange(index, prop, value);
  };

  const handleRemoveField = (index) => {
    onRemoveField(index);
    setSelectedElement(null);
  };

  return (
    <div className="space-y-4">
      {/* Canvas Toolbar */}
      <DesignerToolbar
        mode={mode}
        zoom={zoom}
        onModeChange={setMode}
        onZoomChange={setZoom}
      />

      {/* Main Designer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Field Palette (3 cols on desktop) */}
        {mode === TEMPLATE_DESIGNER_MODES.DESIGN && (
          <div className="lg:col-span-3 order-2 lg:order-1">
            <FieldPalette
              fields={formData.fields || []}
              photo={formData.photo}
              selectedElement={selectedElement}
              onSelectElement={setSelectedElement}
              onAddField={onAddField}
            />
          </div>
        )}

        {/* Center Column: Design Canvas (6 cols if palette & props open, 12 in preview mode) */}
        <div
          className={`${mode === TEMPLATE_DESIGNER_MODES.DESIGN
              ? 'lg:col-span-6 order-1 lg:order-2'
              : 'lg:col-span-12'
            }`}
        >
          <TemplateCanvas
            template={formData}
            mode={mode}
            zoom={zoom}
            selectedElement={selectedElement}
            onSelectElement={setSelectedElement}
          />
        </div>

        {/* Right Column: Properties Panel (3 cols on desktop) */}
        {mode === TEMPLATE_DESIGNER_MODES.DESIGN && (
          <div className="lg:col-span-3 order-3">
            <PropertiesPanel
              selectedElement={selectedElement}
              formData={formData}
              onUpdatePhoto={handleUpdatePhoto}
              onUpdateField={handleUpdateField}
              onRemoveField={handleRemoveField}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateDesigner;

