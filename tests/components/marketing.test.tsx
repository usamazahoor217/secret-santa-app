import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Navbar } from '@/components/marketing/navbar';
import { Hero } from '@/components/marketing/hero';
import { HowItWorks } from '@/components/marketing/how-it-works';
import { Features } from '@/components/marketing/features';
import { PricingSection } from '@/components/marketing/pricing-section';
import { FAQSection } from '@/components/marketing/faq-section';
import { CTABanner } from '@/components/marketing/cta-banner';
import { Footer } from '@/components/marketing/footer';

describe('Marketing Landing Page Components', () => {
  const mockAppUrl = 'http://app.localhost:3001';

  describe('Navbar Component', () => {
    it('renders branding and primary navigation links', () => {
      render(<Navbar />);

      expect(screen.getByText(/SecretSanta/i)).toBeInTheDocument();
      expect(screen.getByText(/How It Works/i)).toBeInTheDocument();
      expect(screen.getByText(/Features/i)).toBeInTheDocument();
      expect(screen.getByText(/Pricing/i)).toBeInTheDocument();
      expect(screen.getByText(/FAQ/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /start an exchange/i })).toBeInTheDocument();
    });
  });

  describe('Hero Component', () => {
    it('renders high-converting headline, social proof, and primary CTA linking to app', () => {
      render(<Hero appUrl={mockAppUrl} />);

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Secret Santa/i);
      expect(screen.getByText(/4.9\/5/i)).toBeInTheDocument();
      expect(screen.getByText(/Zero-Spoiler Guarantee/i)).toBeInTheDocument();

      const ctaLink = screen.getByRole('link', { name: /create an exchange/i });
      expect(ctaLink).toHaveAttribute('href', mockAppUrl);
    });
  });

  describe('HowItWorks Component', () => {
    it('renders all 3 steps with numbered badges and call to action', () => {
      render(<HowItWorks appUrl={mockAppUrl} />);

      expect(screen.getByText('01')).toBeInTheDocument();
      expect(screen.getByText('Create Your Event')).toBeInTheDocument();

      expect(screen.getByText('02')).toBeInTheDocument();
      expect(screen.getByText('Invite & Set Exclusions')).toBeInTheDocument();

      expect(screen.getByText('03')).toBeInTheDocument();
      expect(screen.getByText('Reveal With Zero Spoilers')).toBeInTheDocument();

      const ctaLink = screen.getByRole('link', { name: /start your free exchange now/i });
      expect(ctaLink).toHaveAttribute('href', mockAppUrl);
    });
  });

  describe('Features Component', () => {
    it('renders all 6 core feature cards', () => {
      render(<Features />);

      expect(screen.getByText(/Zero-Spoiler Architecture/i)).toBeInTheDocument();
      expect(screen.getByText(/Derangement Constraint Engine/i)).toBeInTheDocument();
      expect(screen.getByText(/Resend Magic Email Delivery/i)).toBeInTheDocument();
      expect(screen.getByText(/Integrated Wishlists/i)).toBeInTheDocument();
      expect(screen.getByText(/100% Mobile Optimized/i)).toBeInTheDocument();
      expect(screen.getByText(/Large Groups & Festive Passes/i)).toBeInTheDocument();
    });
  });

  describe('PricingSection Component', () => {
    it('renders Free and Pro pricing cards with feature breakdowns', () => {
      render(<PricingSection appUrl={mockAppUrl} />);

      expect(screen.getByText(/Free Elf Tier/i)).toBeInTheDocument();
      expect(screen.getByText('$0')).toBeInTheDocument();
      expect(screen.getByText(/Santa Pro Pass/i)).toBeInTheDocument();
      expect(screen.getByText('$9.99')).toBeInTheDocument();

      const freeButton = screen.getByRole('button', { name: /start free exchange/i });
      expect(freeButton).toBeInTheDocument();

      const proButton = screen.getByRole('button', { name: /get started with pro/i });
      expect(proButton).toBeInTheDocument();
    });
  });

  describe('FAQSection Component', () => {
    it('renders questions and expands answer when clicked', () => {
      render(<FAQSection />);

      const firstQuestion = screen.getByText(/Can the organizer see who drew whom\?/i);
      expect(firstQuestion).toBeInTheDocument();

      // Click to toggle second FAQ
      const secondQuestion = screen.getByText(/Do participants need to download an app or create an account\?/i);
      fireEvent.click(secondQuestion);

      expect(
        screen.getByText(/Each participant receives a personalized email from Resend/i)
      ).toBeInTheDocument();
    });
  });

  describe('CTABanner Component', () => {
    it('renders high-impact bottom banner and CTA button', () => {
      render(<CTABanner appUrl={mockAppUrl} />);

      expect(screen.getByText(/Make This Year's Gift Exchange/i)).toBeInTheDocument();
      const startButton = screen.getByRole('button', { name: /start your secret santa now/i });
      expect(startButton).toBeInTheDocument();
    });
  });

  describe('Footer Component', () => {
    it('renders copyright and design standards notice', () => {
      render(<Footer appUrl={mockAppUrl} />);

      expect(screen.getAllByText(/Secret Santa Organizer/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/15px border radius/i)).toBeInTheDocument();
    });
  });
});
