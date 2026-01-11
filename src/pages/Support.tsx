import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Phone, MessageCircle, Mail, Clock, MapPin, HelpCircle, Package, CreditCard, Truck } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useSettings } from '@/hooks/useSettings';
import { Skeleton } from '@/components/ui/skeleton';

const faqs = [
  {
    question: 'How long does delivery take?',
    answer: 'Delivery within Dhaka typically takes 1-2 business days. For locations outside Dhaka, it may take 3-5 business days depending on the area.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept Cash on Delivery (COD) and bKash. For bKash, please send the payment to our merchant number and provide the transaction ID during checkout.',
  },
  {
    question: 'Can I return or exchange products?',
    answer: 'Yes, we accept returns within 7 days of delivery for most products. The item must be unused and in its original packaging. Please contact our support team to initiate a return.',
  },
  {
    question: 'How do I track my order?',
    answer: 'You can track your order status in the "My Orders" section of your account. We also send updates via SMS for order confirmations and delivery.',
  },
  {
    question: 'What if I receive a damaged product?',
    answer: 'If you receive a damaged product, please contact us within 24 hours with photos of the damage. We will arrange a replacement or refund promptly.',
  },
];

const Support = () => {
  const { settings, loading } = useSettings();

  const ContactSkeleton = () => (
    <div className="flex flex-col items-center p-6 bg-card rounded-xl border border-border">
      <Skeleton className="w-14 h-14 rounded-full mb-4" />
      <Skeleton className="h-5 w-20 mb-1" />
      <Skeleton className="h-4 w-28 mb-3" />
      <Skeleton className="h-5 w-32" />
    </div>
  );

  return (
    <Layout>
      <div className="container-main py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
            How can we help you?
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            We're here to assist you with any questions or concerns about your orders and shopping experience.
          </p>
        </div>

        {/* Contact Options */}
        <div className="grid sm:grid-cols-3 gap-4 mb-12">
          {loading ? (
            <>
              <ContactSkeleton />
              <ContactSkeleton />
              <ContactSkeleton />
            </>
          ) : (
            <>
              {settings.phone && (
                <a
                  href={`tel:${settings.phone}`}
                  className="flex flex-col items-center p-6 bg-card rounded-xl border border-border hover:border-primary transition-colors text-center"
                >
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">Call Us</h3>
                  <p className="text-sm text-muted-foreground mb-3">Mon-Sat, 9AM-9PM</p>
                  <span className="text-primary font-medium">{settings.phone}</span>
                </a>
              )}

              {settings.whatsapp && (
                <a
                  href={`https://wa.me/${settings.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center p-6 bg-card rounded-xl border border-border hover:border-success transition-colors text-center"
                >
                  <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center mb-4">
                    <MessageCircle className="w-6 h-6 text-success" />
                  </div>
                  <h3 className="font-semibold mb-1">WhatsApp</h3>
                  <p className="text-sm text-muted-foreground mb-3">Quick responses</p>
                  <span className="text-success font-medium">Chat Now</span>
                </a>
              )}

              {settings.email && (
                <a
                  href={`mailto:${settings.email}`}
                  className="flex flex-col items-center p-6 bg-card rounded-xl border border-border hover:border-primary transition-colors text-center"
                >
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">Email Us</h3>
                  <p className="text-sm text-muted-foreground mb-3">We reply within 24hrs</p>
                  <span className="text-primary font-medium">{settings.email}</span>
                </a>
              )}

              {!settings.phone && !settings.whatsapp && !settings.email && (
                <div className="sm:col-span-3 text-center py-8 text-muted-foreground">
                  <p>Contact information not available. Please check back later.</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Location */}
        {loading ? (
          <div className="mb-12 p-6 bg-card rounded-xl border border-border">
            <div className="flex items-start gap-4">
              <Skeleton className="w-12 h-12 rounded-full shrink-0" />
              <div className="flex-1">
                <Skeleton className="h-5 w-28 mb-2" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
          </div>
        ) : settings.location ? (
          <div className="mb-12 p-6 bg-card rounded-xl border border-border">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Our Location</h3>
                <p className="text-muted-foreground whitespace-pre-line">{settings.location}</p>
              </div>
            </div>
          </div>
        ) : null}

        {/* Quick Help Topics */}
        <div className="grid md:grid-cols-4 gap-4 mb-12">
          {[
            { icon: Package, label: 'Order Issues', desc: 'Track, cancel, or modify orders' },
            { icon: Truck, label: 'Delivery', desc: 'Shipping info & tracking' },
            { icon: CreditCard, label: 'Payments', desc: 'Payment methods & refunds' },
            { icon: HelpCircle, label: 'Returns', desc: 'Return & exchange policy' },
          ].map((item) => (
            <div key={item.label} className="p-4 bg-secondary rounded-xl">
              <item.icon className="w-8 h-8 text-primary mb-3" />
              <h4 className="font-semibold mb-1">{item.label}</h4>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* FAQs */}
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-2xl font-bold text-center mb-6">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card rounded-xl border border-border px-4"
              >
                <AccordionTrigger className="text-left font-medium py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Business Hours */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-full">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">Business Hours: Saturday - Thursday, 9:00 AM - 9:00 PM</span>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Support;
