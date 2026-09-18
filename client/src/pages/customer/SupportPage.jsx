import React, { useState } from 'react';
import { HelpCircle, Phone, Mail, MessageSquare, ChevronDown, ChevronUp, Send, CheckCircle2 } from 'lucide-react';
import VoiceRecorder from '../../components/common/VoiceRecorder';

export const SupportPage = () => {
  const [openFaq, setOpenFaq] = useState(0);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [voiceNoteUrl, setVoiceNoteUrl] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const faqs = [
    {
      q: 'How does multi-seller split checkout work?',
      a: 'When you purchase crafts from multiple rural artisans, you make one single payment. NativeRise automatically creates independent order trackings for each maker, so each seller packs and dispatches their items with dedicated checkpoint transparency.'
    },
    {
      q: 'What is the Community Trust Circle?',
      a: 'Local Gram Panchayats and artisan elders vouch for rural sellers on NativeRise. If an issue arises, disputes first enter local mediation before administrative intervention, ensuring fair dispute resolution.'
    },
    {
      q: 'Can I cancel an order and get a refund?',
      a: 'Yes! If an order is cancelled before the maker marks it "Ready for Pickup", a full refund is processed automatically. After packing, our team reviews the transit state to resolve fairly.'
    },
    {
      q: 'How are delivery fees calculated for remote rural areas?',
      a: 'NativeRise uses a single unified formula based on actual transit distance and weight, preventing inflated courier markups and protecting rural makers and customers.'
    }
  ];

  const handleVoiceTranscription = ({ voiceNoteUrl: url, transcribedText }) => {
    setVoiceNoteUrl(url);
    if (transcribedText) {
      setTicketMessage((prev) => prev ? `${prev}\n\n[Voice Note]: ${transcribedText}` : `[Voice Note]: ${transcribedText}`);
    }
  };

  const handleTicketSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTicketSubject('');
    setTicketMessage('');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold text-secondary uppercase tracking-wider">
          Help & Grievance Redressal
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-accent-dark">
          NativeRise Support Center
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary">
          We are committed to transparent, fair, and multilingual assistance for rural buyers and makers.
        </p>
      </div>

      {/* Quick Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-base p-6 space-y-2 text-center">
          <div className="w-10 h-10 rounded-xl bg-accent-light text-accent-dark mx-auto flex items-center justify-center">
            <Phone className="w-5 h-5" />
          </div>
          <h4 className="font-serif font-bold text-sm text-text-primary">Rural Helpline</h4>
          <p className="text-xs text-text-secondary">Toll-Free (Mon - Sat, 9am - 7pm)</p>
          <span className="font-bold text-xs text-accent block">1800-123-NATIVERISE</span>
        </div>

        <div className="card-base p-6 space-y-2 text-center">
          <div className="w-10 h-10 rounded-xl bg-secondary-light text-secondary-dark mx-auto flex items-center justify-center">
            <Mail className="w-5 h-5" />
          </div>
          <h4 className="font-serif font-bold text-sm text-text-primary">Email Support</h4>
          <p className="text-xs text-text-secondary">24-hour turnaround</p>
          <span className="font-bold text-xs text-secondary block">support@nativerise.test</span>
        </div>

        <div className="card-base p-6 space-y-2 text-center">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 mx-auto flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h4 className="font-serif font-bold text-sm text-text-primary">Voice Grievance</h4>
          <p className="text-xs text-text-secondary">Record in any of 12 languages</p>
          <span className="font-bold text-xs text-emerald-700 block">Auto-Transcribed</span>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-4">
        <h3 className="font-serif text-xl font-bold text-text-primary border-b border-border pb-3">
          Frequently Asked Questions
        </h3>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="card-base p-4 cursor-pointer" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              <div className="flex items-center justify-between text-xs font-bold text-text-primary">
                <span>{faq.q}</span>
                {openFaq === i ? <ChevronUp className="w-4 h-4 text-accent" /> : <ChevronDown className="w-4 h-4" />}
              </div>
              {openFaq === i && (
                <p className="text-xs text-text-secondary mt-3 pt-3 border-t border-border leading-relaxed">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Support Ticket Form with Voice Recording */}
      <div className="card-base p-6 sm:p-8 space-y-6">
        <h3 className="font-serif text-xl font-bold text-text-primary border-b border-border pb-3">
          Submit a Ticket or Voice Grievance
        </h3>

        {submitted ? (
          <div className="p-6 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h4 className="font-serif font-bold text-base">Support Ticket Registered!</h4>
            <p className="text-xs text-emerald-800">
              Our regional grievance coordinator will follow up within 4 business hours.
            </p>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="btn-outline text-xs mt-3"
            >
              Submit Another Inquiry
            </button>
          </div>
        ) : (
          <form onSubmit={handleTicketSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-text-secondary mb-1">Subject / Issue Summary</label>
              <input
                type="text"
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                placeholder="e.g. Inquiry regarding Wayanad spice delivery route"
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-border bg-white"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-text-secondary mb-1">
                Record Voice Note in Your Language (Optional)
              </label>
              <VoiceRecorder onTranscriptionReceived={handleVoiceTranscription} />
            </div>

            <div>
              <label className="block font-semibold text-text-secondary mb-1">Detailed Message</label>
              <textarea
                rows={4}
                value={ticketMessage}
                onChange={(e) => setTicketMessage(e.target.value)}
                placeholder="Type your inquiry here or speak into the voice note above..."
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-border bg-white"
                required
              />
            </div>

            <button type="submit" className="btn-primary py-2.5 px-6 text-xs flex items-center gap-2">
              <Send className="w-4 h-4" />
              <span>Submit Support Ticket</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SupportPage;
