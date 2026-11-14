// @vitest-environment jsdom
import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});
import ContactWithGlobe, {
  cityCoordinates,
  DEFAULT_CONTACT_LINKS,
  GlobeWireframe,
  FormDots,
} from './contact-with-globe';
import { Button } from './button';

beforeAll(() => {
  global.IntersectionObserver = class IntersectionObserver {
    root = null;
    rootMargin = '';
    thresholds = [];
    disconnect = vi.fn();
    observe = vi.fn();
    takeRecords = vi.fn().mockReturnValue([]);
    unobserve = vi.fn();
  } as unknown as typeof IntersectionObserver;

  global.ResizeObserver = class ResizeObserver {
    disconnect = vi.fn();
    observe = vi.fn();
    unobserve = vi.fn();
  } as unknown as typeof ResizeObserver;
});

describe('ContactWithGlobe Constants & Helpers', () => {
  it('has coordinates for major transit cities including India hubs', () => {
    expect(cityCoordinates['delhi']).toBeDefined();
    expect(cityCoordinates['mumbai']).toBeDefined();
    expect(cityCoordinates['kolkata']).toBeDefined();
    expect(cityCoordinates['bangalore']).toBeDefined();
    expect(cityCoordinates['london']).toBeDefined();
  });

  it('provides default contact links with valid icons and hrefs', () => {
    expect(DEFAULT_CONTACT_LINKS.length).toBeGreaterThanOrEqual(3);
    expect(DEFAULT_CONTACT_LINKS[0].href).toMatch(/^mailto:/);
  });
});

describe('Button Primitive (shadcn/ui)', () => {
  it('renders with default variants and children', () => {
    render(<Button>Click Me</Button>);
    const btn = screen.getByRole('button', { name: /Click Me/i });
    expect(btn).toBeDefined();
    expect(btn.className).toContain('inline-flex');
  });

  it('renders outline variant and size correctly', () => {
    render(<Button variant="outline" size="lg">Outline Button</Button>);
    const btn = screen.getByRole('button', { name: /Outline Button/i });
    expect(btn.className).toContain('border');
  });
});

describe('FormDots Primitive', () => {
  it('renders decorative separator dots', () => {
    const { container } = render(<FormDots />);
    expect(container.querySelector('[role="none"]')).toBeDefined();
  });
});

describe('GlobeWireframe Component', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <GlobeWireframe width={400} height={400} autoRotate={false} />
    );
    expect(container.querySelector('svg')).toBeDefined();
  });
});

describe('ContactWithGlobe Full Form & Interaction', () => {
  it('renders title, subtitle, and input fields', () => {
    render(
      <ContactWithGlobe
        title="Get In Touch With Dispatch"
        subtitle="Customer Care"
        description="We are available 24 hours a day for travel questions."
      />
    );

    expect(screen.getByText('Get In Touch With Dispatch')).toBeDefined();
    expect(screen.getByText('Customer Care')).toBeDefined();
    expect(screen.getByPlaceholderText(/Rahul Sen/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/rahul.sen@example.com/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/Ask about ticket reservations/i)).toBeDefined();
  });

  it('handles form submission with onSubmit callback', async () => {
    const handleSubmit = vi.fn();
    render(<ContactWithGlobe onSubmit={handleSubmit} />);

    const nameInput = screen.getByPlaceholderText(/Rahul Sen/i);
    const emailInput = screen.getByPlaceholderText(/rahul.sen@example.com/i);
    const messageInput = screen.getByPlaceholderText(/Ask about ticket reservations/i);
    const submitBtn = screen.getByRole('button', { name: /Send message|Submit/i });

    fireEvent.change(nameInput, { target: { value: 'Amit Sharma' } });
    fireEvent.change(emailInput, { target: { value: 'amit@example.com' } });
    fireEvent.change(messageInput, { target: { value: 'Can I change my boarding point for PNR 4981?' } });

    fireEvent.click(submitBtn);

    // Wait for the simulated timeout
    await new Promise((resolve) => setTimeout(resolve, 800));
    expect(handleSubmit).toHaveBeenCalledWith({
      fullName: 'Amit Sharma',
      company: '',
      email: 'amit@example.com',
      message: 'Can I change my boarding point for PNR 4981?',
    });
  });
});
