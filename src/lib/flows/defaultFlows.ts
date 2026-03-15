import { FlowNode } from './types'

export const GUEST_FLOWS: { [key: string]: FlowNode[] } = {
  'pre-arrival': [
    {
      id: 'welcome',
      type: 'buttons',
      content: {
        type: 'list',
        header: { type: 'text', text: 'Welcome!' },
        body: { text: "Welcome to [property_name]! I'm your virtual concierge. Your check-in is confirmed. How can I help you prepare for your stay?" },
        footer: { text: 'WazMeUp Concierge' },
        action: {
          button: 'View Options',
          sections: [
            {
              title: 'Stay Information',
              rows: [
                { id: 'checkin_inst', title: 'Check-in instructions', description: 'When and how to check in' },
                { id: 'room_details', title: 'Room details', description: 'What is included in your room' },
                { id: 'get_here', title: 'How to get here', description: 'Directions and location' },
              ],
            },
            {
              title: 'Recommendations',
              rows: [
                { id: 'local_rec', title: 'Local recommendations', description: 'Food and attractions' },
                { id: 'contact_staff', title: 'Contact reception', description: 'Speak to a human' },
              ],
            },
          ],
        },
      },
    },
    {
      id: 'checkin_inst',
      type: 'text',
      content: 'Check-in time is 3:00 PM. Your room access code will be sent 2 hours before arrival. Reception is open 8am-10pm. For late arrivals, please call [property_phone].',
      next: 'welcome',
    },
    {
      id: 'room_details',
      type: 'text',
      content: 'Your room includes: WiFi (password sent on arrival), AC, Smart TV, mini fridge, and a welcome amenity pack.',
      next: 'welcome',
    },
    {
      id: 'get_here',
      type: 'text',
      content: 'We are located at [property_address]. \nGoogle Maps: [google_maps_link] \nComing from the airport? Take the main highway north for 20 mins.',
      next: 'welcome',
    },
    {
      id: 'local_rec',
      type: 'text',
      content: 'Here are our top picks: \n1. Gusto Kitchen (Italian) \n2. The Blue Bar (Cocktails) \n3. Sunset Beach (10 min walk) \nEnjoy!',
      next: 'welcome',
    },
    {
      id: 'contact_staff',
      type: 'end',
      content: 'One moment while I connect you with our reception team...',
    },
  ],
  'in-stay': [
    {
      id: 'welcome',
      type: 'buttons',
      content: {
        type: 'button',
        body: { text: 'How can we assist you during your stay?' },
        action: {
          buttons: [
            { type: 'reply', reply: { id: 'maint', title: 'Maintenance Issue' } },
            { type: 'reply', reply: { id: 'service', title: 'Room Service' } },
            { type: 'reply', reply: { id: 'question', title: 'Ask a Question' } },
          ],
        },
      },
    },
    {
      id: 'maint',
      type: 'text',
      content: 'Please describe the issue briefly (e.g. AC not working, leaking tap):',
      next: 'maint_logged',
    },
    {
      id: 'maint_logged',
      type: 'text',
      content: 'Thank you. We have logged your request #[request_id]. Our team will respond within 30 minutes.',
    },
    {
      id: 'service',
      type: 'text',
      content: 'Our room service menu is available at [menu_link]. To order, please call reception at [property_phone] or reply here and a staff member will assist you.',
    },
    {
      id: 'question',
      type: 'text',
      content: 'What would you like to know? Send your question and a staff member will reply shortly.',
    },
  ],
  'post-stay': [
    {
      id: 'welcome',
      type: 'text',
      content: 'Thank you for staying at [property_name]! We hope you had a wonderful experience.',
      next: 'feedback_options',
    },
    {
      id: 'feedback_options',
      type: 'buttons',
      content: {
        type: 'button',
        body: { text: 'What would you like to do next?' },
        action: {
          buttons: [
            { type: 'reply', reply: { id: 'review', title: 'Leave a Review' } },
            { type: 'reply', reply: { id: 'book', title: 'Book Again' } },
            { type: 'reply', reply: { id: 'discount', title: 'Loyalty Discount' } },
          ],
        },
      },
    },
    {
      id: 'review_info',
      type: 'text',
      content: 'We would love your review! Please rate us on Google: [google_review_link]',
    },
    {
      id: 'book_info',
      type: 'text',
      content: 'Book your next stay directly and get 10% off! Reply YES to get available dates.',
    },
  ],
}

// Keeping compatibility with existing structure but leaning towards GUEST_FLOWS
export const GUEST_DEFAULT_FLOW: FlowNode[] = GUEST_FLOWS['pre-arrival']

export const OWNER_DEFAULT_FLOW: FlowNode[] = [
  {
    id: 'welcome',
    type: 'buttons',
    content: {
      type: 'button',
      body: { text: 'Hi! This is your WazMeUp owner portal. What would you like to know?' },
      action: {
        buttons: [
          { type: 'reply', reply: { id: 'summary', title: 'This week summary' } },
          { type: 'reply', reply: { id: 'occupancy', title: 'Current occupancy' } },
          { type: 'reply', reply: { id: 'contact', title: 'Contact manager' } },
        ],
      },
    },
  },
  {
    id: 'week_summary',
    type: 'text',
    content: 'This week summary: \n- Revenue: $1,250\n- New bookings: 3\n- Guest satisfaction: 4.8/5',
    next: 'welcome',
  },
  {
    id: 'occupancy_info',
    type: 'text',
    content: 'Current occupancy: 85% across your portfolio. 2 units are currently vacant.',
    next: 'welcome',
  },
  {
    id: 'contact_manager',
    type: 'end',
    content: 'Transferring you to your dedicated property manager...',
  },
]

export const INVESTOR_DEFAULT_FLOW: FlowNode[] = [
  {
    id: 'welcome',
    type: 'text',
    content: 'Hello! Here is your monthly portfolio update: \n- Monthly ROI: 8.2%\n- Net Operating Income: $45,000\n- Portfolio Valuation: $5.2M',
    next: 'investor_options',
  },
  {
    id: 'investor_options',
    type: 'buttons',
    content: {
      type: 'button',
      body: { text: 'What would you like to do next?' },
      action: {
        buttons: [
          { type: 'reply', reply: { id: 'report', title: 'View full report' } },
          { type: 'reply', reply: { id: 'alert', title: 'Set alert threshold' } },
          { type: 'reply', reply: { id: 'contact', title: 'Contact us' } },
        ],
      },
    },
  },
]
