import React, { useState } from 'react';
import DesignerToolbar from './DesignerToolbar.jsx';
import FieldPalette from './FieldPalette.jsx';
import TemplateCanvas from './TemplateCanvas.jsx';
import PropertiesPanel from './PropertiesPanel.jsx';
import { TEMPLATE_DESIGNER_MODES, DEFAULT_DESIGNER_ZOOM } from '../../../constants/template.js';

/**
 * Visual designer: elements list | card canvas | properties.
 * Saara data TemplateForm ke paas rehta hai; ye sirf selection, zoom aur mode sambhalta hai.
 */
export const TemplateDesigner = ({
  formData,
  usableAssets = [],
  assetsLoading = false,
  onAddField,
  onUpdateField,
  onRemoveField,
  onAddPhoto,
  onUpdatePhoto,
  onAddQrCode,
  onUpdateQrCode,
  onAddLayer,
  onUpdateLayer,
  onRemoveLayer,
}) => {
  const [mode, setMode] = useState(TEMPLATE_DESIGNER_MODES.DESIGN);
  const [zoom, setZoom] = useState(DEFAULT_DESIGNER_ZOOM);
  const [selectedElement, setSelectedElement] = useState(null);

  const isDesign = mode === TEMPLATE_DESIGNER_MODES.DESIGN;

  // Remove ke baad selection saaf
  const clearAfter = (fn) => (...args) => {
    fn(...args);
    setSelectedElement(null);
  };

  const handleUpdatePhoto = (photo) => {
    onUpdatePhoto(photo);
    if (photo === null) setSelectedElement(null);
  };

  const handleUpdateQrCode = (qr) => {
    onUpdateQrCode(qr);
    if (qr === null) setSelectedElement(null);
  };

  return (
    <div className="space-y-4">
      <DesignerToolbar mode={mode} zoom={zoom} onModeChange={setMode} onZoomChange={setZoom} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {isDesign && (
          <div className="lg:col-span-3 order-2 lg:order-1">
            <FieldPalette
              formData={formData}
              usableAssets={usableAssets}
              assetsLoading={assetsLoading}
              selectedElement={selectedElement}
              onSelectElement={setSelectedElement}
              onAddField={onAddField}
              onAddPhoto={() => {
                onAddPhoto();
                setSelectedElement({ type: 'PHOTO', id: 'photo' });
              }}
              onAddQrCode={() => {
                onAddQrCode();
                setSelectedElement({ type: 'QR', id: 'qrCode' });
              }}
              onAddLayer={onAddLayer}
            />
          </div>
        )}

        <div className={isDesign ? 'lg:col-span-6 order-1 lg:order-2' : 'lg:col-span-12'}>
          <TemplateCanvas
            template={formData}
            mode={mode}
            zoom={zoom}
            selectedElement={selectedElement}
            onSelectElement={setSelectedElement}
          />
        </div>

        {isDesign && (
          <div className="lg:col-span-3 order-3">
            <PropertiesPanel
              selectedElement={selectedElement}
              formData={formData}
              usableAssets={usableAssets}
              onUpdateField={onUpdateField}
              onRemoveField={clearAfter(onRemoveField)}
              onUpdatePhoto={handleUpdatePhoto}
              onUpdateQrCode={handleUpdateQrCode}
              onUpdateLayer={onUpdateLayer}
              onRemoveLayer={clearAfter(onRemoveLayer)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateDesigner;