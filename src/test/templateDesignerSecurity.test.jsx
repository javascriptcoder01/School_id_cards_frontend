import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import TemplateLivePreview from '../components/templates/designer/TemplateLivePreview.jsx';
import TemplateCanvas from '../components/templates/designer/TemplateCanvas.jsx';
import apiClient from '../api/apiClient.js';

describe('TEMPLATE DESIGNER SECURITY & SANITIZATION', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('1. Live preview does not make any backend student API calls', () => {
    const apiSpy = vi.spyOn(apiClient, 'get');

    const template = {
      name: 'Safe Template',
      width: 86,
      height: 54,
      photo: { x: 55, y: 20, width: 25, height: 30 },
      fields: [{ field: 'name', x: 10, y: 30 }],
    };

    render(<TemplateLivePreview template={template} />);

    expect(apiSpy).not.toHaveBeenCalled();
  });

  it('2. Image tags sanitize unsafe and script URLs, preventing arbitrary HTML injection', () => {
    const maliciousTemplate = {
      name: 'XSS Attempt',
      background: 'javascript:alert(1)',
      logo: '<script>alert("hack")</script>',
      width: 86,
      height: 54,
      photo: null,
      fields: [],
    };

    const { container } = render(<TemplateCanvas template={maliciousTemplate} />);

    expect(container.querySelectorAll('script')).toHaveLength(0);
    expect(container.innerHTML).not.toContain('<script>');
    expect(container.innerHTML).not.toContain('javascript:alert(1)');
    expect(container.innerHTML).not.toContain('Authorization: Bearer');
  });

  it('3. Does not expose tokens or Mongo metadata in DOM', () => {
    const templateWithMetadata = {
      _id: 'db_id_123',
      __v: 0,
      token: 'jwt_secret_token_12345',
      name: 'Clean Template',
      width: 86,
      height: 54,
      fields: [],
    };

    const { container } = render(<TemplateLivePreview template={templateWithMetadata} />);

    expect(container.innerHTML).not.toContain('jwt_secret_token_12345');
    expect(container.innerHTML).not.toContain('__v');
  });
});

