// Customer-facing help and legal text, written from the "Payment Flow & Order Assignment Logic"
// product document (v1.0, Nov 2026). Only what customers experience is here: rider wallets,
// payouts and penalties are internal and stay out of the app.
//
// Payment partner: the doc names Hubtel, the app currently pays through Paystack, so the copy
// says "our payment partner". Fees: the tables follow the doc; checkout always shows the exact amount.

export type Block =
  | { kind: 'p'; text: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'steps'; items: string[] }
  | { kind: 'table'; head: [string, string]; rows: [string, string][] };

export interface Article {
  id: string;
  question: string;
  body: Block[];
}

export type TopicIcon = 'orders' | 'payments' | 'safety' | 'cylinder' | 'account' | 'app';

export interface Topic {
  id: string;
  title: string;
  icon: TopicIcon;
  articles: Article[];
}

const p = (text: string): Block => ({ kind: 'p', text });
const list = (...items: string[]): Block => ({ kind: 'list', items });
const steps = (...items: string[]): Block => ({ kind: 'steps', items });

export const PLATFORM_FEES: [string, string][] = [
  ['Small cylinder', '₵ 5'],
  ['Medium cylinder', '₵ 8'],
  ['Large cylinder', '₵ 12'],
];

export const DELIVERY_FEES: [string, string][] = [
  ['0 – 3 km', '₵ 8'],
  ['3 – 6 km', '₵ 13'],
  ['6 – 10 km', '₵ 18'],
  ['10 km and above', '₵ 25'],
];

export const HELP_TOPICS: Topic[] = [
  {
    id: 'orders',
    title: 'Orders & delivery',
    icon: 'orders',
    articles: [
      {
        id: 'how-it-works',
        question: 'How does a gas delivery work?',
        body: [
          steps(
            'You place an order and choose a filling station, gas amount and payment method.',
            'A nearby rider is assigned and comes to collect your empty cylinder.',
            'The rider fills it at the station you chose.',
            'The rider brings the full cylinder back to you. You can follow every step live on the map.',
          ),
        ],
      },
      {
        id: 'statuses',
        question: 'What do the order statuses mean?',
        body: [
          {
            kind: 'table',
            head: ['Status', 'What is happening'],
            rows: [
              ['Finding rider', 'We are matching you with a rider. Usually under 2 minutes.'],
              ['Rider assigned', "You can see your rider's name, photo, vehicle and number plate. Live tracking starts."],
              ['Rider finishing a delivery', 'Every nearby rider is busy. Yours is finishing a delivery and you are next.'],
              ['Picking up your gas', 'Your rider has your cylinder and is at, or heading to, the filling station.'],
              ['On the way', 'Your full cylinder is on its way back to you.'],
              ['Finding another rider', 'Your rider could not continue. We are on it, no action needed.'],
              ['Delivered', 'Done. Your receipt is ready and you can rate the delivery.'],
            ],
          },
        ],
      },
      {
        id: 'assignment',
        question: 'How is a rider chosen for my order?',
        body: [
          p('Every confirmed order always gets a rider. When your order is confirmed:'),
          steps(
            'The three nearest available riders (within 5 km of the station) are notified at once. The first to accept gets your order.',
            'If nobody accepts within 30 seconds, we widen the search to 10 km.',
            'If there is still no answer, the closest available rider is assigned automatically.',
            'If every rider nearby is busy, your order goes to the rider who will be free soonest, and we show you the wait time.',
          ),
        ],
      },
      {
        id: 'queued',
        question: 'Why does it say "Rider finishing a delivery"?',
        body: [
          p(
            "All riders near you were busy, so your order is lined up with the rider who will finish soonest. You'll see an estimated wait, and we'll notify you the moment your rider starts on your order.",
          ),
          p('If that delivery runs past 15 minutes, we automatically look for another rider for you.'),
        ],
      },
      {
        id: 'rider-cancelled',
        question: 'My rider cancelled. What happens now?',
        body: [
          p(
            'If your rider cancels before collecting your cylinder, we start finding you a new rider straight away and your app shows "Finding another rider". You don\'t need to do anything or place the order again.',
          ),
        ],
      },
      {
        id: 'cancel',
        question: 'Can I cancel my order?',
        body: [
          p(
            "You can cancel from the order screen until a rider accepts it. After that, the rider is already on the way to you, so contact support if something has changed.",
          ),
        ],
      },
    ],
  },
  {
    id: 'payments',
    title: 'Payments & fees',
    icon: 'payments',
    articles: [
      {
        id: 'methods',
        question: 'How can I pay?',
        body: [
          list(
            'In the app: MTN Mobile Money, Telecel (Vodafone) Cash, AirtelTigo Money, or a debit or credit card.',
            'Cash on delivery: pay the rider when your full cylinder arrives.',
          ),
          p('You choose at checkout. The total is the same whichever way you pay.'),
        ],
      },
      {
        id: 'pay-in-app',
        question: 'How does paying in the app work?',
        body: [
          p(
            'You pay the full amount before the rider is sent. Your order shows "Pending payment" until our payment partner confirms it, then a rider is assigned. Nothing is paid at the door.',
          ),
        ],
      },
      {
        id: 'cash',
        question: 'How does cash on delivery work?',
        body: [
          p('Pay the rider the full order total in cash when your cylinder is delivered: the gas, the delivery fee and the service fee together.'),
          p('Please have the exact amount ready if you can. The total is shown in the app before you confirm the order.'),
        ],
      },
      {
        id: 'fees',
        question: 'What am I paying for?',
        body: [
          p('Your total has three parts:'),
          list('Gas: the price of the gas you chose, paid to the filling station.', 'Delivery fee: depends on the distance.', 'Service fee: depends on the cylinder size.'),
          { kind: 'table', head: ['Distance', 'Delivery fee'], rows: DELIVERY_FEES },
          { kind: 'table', head: ['Cylinder', 'Service fee'], rows: PLATFORM_FEES },
          p('Example: a medium cylinder with ₵ 80 of gas delivered 3–6 km away costs ₵ 80 + ₵ 13 + ₵ 8 = ₵ 101. Checkout always shows your exact total before you confirm.'),
        ],
      },
      {
        id: 'wrong-charge',
        question: 'I was charged the wrong amount',
        body: [p('Open the order from Orders, tap Rate, then "Report a problem" and choose "Charged the wrong amount". Our team will check it and get back to you.')],
      },
    ],
  },
  {
    id: 'safety',
    title: 'Riders & safety',
    icon: 'safety',
    articles: [
      {
        id: 'identify',
        question: 'How do I know it is my rider?',
        body: [
          p("Once a rider is assigned, the tracking screen shows their name, photo, rating, vehicle and number plate. Check the plate before you hand over your cylinder."),
        ],
      },
      {
        id: 'contact-rider',
        question: 'How do I contact my rider?',
        body: [p('Tap the green call button on the tracking screen while your order is active.')],
      },
      {
        id: 'rate-report',
        question: 'How do I rate or report a rider?',
        body: [
          p('You are asked to rate each delivery when it finishes. You can also rate later from the order in Orders.'),
          p('To report a problem, open the rating page and tap "Report a problem with this delivery". Our team follows up by email.'),
        ],
      },
    ],
  },
  {
    id: 'cylinders',
    title: 'Cylinders & gas',
    icon: 'cylinder',
    articles: [
      {
        id: 'not-full',
        question: 'My cylinder was not fully filled',
        body: [p('Report it from the order: tap Rate, then "Report a problem" and choose "Cylinder not fully filled". Add any details that help.')],
      },
      {
        id: 'damaged',
        question: 'My cylinder is damaged or leaking',
        body: [
          p('For your safety, keep the cylinder outdoors, away from flames and switches, and do not use it.'),
          p('Then report it from the order ("Cylinder damaged or leaking") or call us from Contact a support agent.'),
        ],
      },
      {
        id: 'rubber',
        question: 'Can the rider change my cylinder rubber?',
        body: [p('Yes. When choosing your gas amount, turn on rubber change. The small fee is added to your total.')],
      },
    ],
  },
  {
    id: 'account',
    title: 'Account & privacy',
    icon: 'account',
    articles: [
      {
        id: 'edit',
        question: 'How do I change my details?',
        body: [p('Go to Profile, then Personal Information to change your name or add a phone number or email. New contact details are confirmed with a code.')],
      },
      {
        id: 'password',
        question: 'Can I sign in with a password?',
        body: [p('Yes. Go to Profile, then Privacy & Security, then Set password.')],
      },
      {
        id: 'saved-places',
        question: 'How do saved places work?',
        body: [p('Add Home, Work or any place from Profile, then Saved Addresses. They appear when you choose a delivery location. Saved places are kept on your phone.')],
      },
      {
        id: 'delete',
        question: 'How do I delete my account?',
        body: [p('Go to Profile, then Privacy & Security, then Delete Account. We ask why you are leaving, then delete your account and confirm by email.')],
      },
    ],
  },
  {
    id: 'app',
    title: 'App & map issues',
    icon: 'app',
    articles: [
      {
        id: 'location',
        question: 'My location is wrong on the map',
        body: [
          p('Make sure location access is turned on for GasApp in your phone settings, then tap the locate button on the map.'),
          p('You can also pick a saved place or search for your address when choosing your delivery location.'),
        ],
      },
      {
        id: 'notifications',
        question: "I'm not getting notifications",
        body: [p('Check Profile, then Notification, and make sure notifications are allowed for GasApp in your phone settings.')],
      },
    ],
  },
];

export interface LegalSection {
  title: string;
  body: Block[];
}

export const LEGAL_UPDATED = 'November 2026';

// DRAFT: written from the product document. Have it reviewed by a lawyer before release.
export const TERMS: LegalSection[] = [
  {
    title: '1. About GasApp',
    body: [
      p(
        'GasApp connects you with independent delivery riders and partner filling stations to refill your LPG cylinder. By creating an account or placing an order, you agree to these terms.',
      ),
    ],
  },
  {
    title: '2. Your account',
    body: [
      list(
        'Give accurate details, including a phone number we can reach you on.',
        'Keep your sign-in codes and password private. You are responsible for orders placed from your account.',
        'You can delete your account at any time from Privacy & Security.',
      ),
    ],
  },
  {
    title: '3. Orders',
    body: [
      p(
        'When you place an order, a rider collects your empty cylinder, fills it at the station you chose and returns it to you. Every confirmed order is assigned a rider; if all nearby riders are busy, your order is queued with the rider who will be free soonest and we show you the expected wait.',
      ),
      p('You can cancel an order until a rider accepts it. If an assigned rider cancels before collecting your cylinder, we find you another rider at no extra cost.'),
    ],
  },
  {
    title: '4. Prices and fees',
    body: [
      p('Your total is the gas price, a delivery fee based on distance, and a service fee based on cylinder size. The exact total is shown before you confirm. The same total applies whether you pay in the app or in cash.'),
      { kind: 'table', head: ['Distance', 'Delivery fee'], rows: DELIVERY_FEES },
      { kind: 'table', head: ['Cylinder', 'Service fee'], rows: PLATFORM_FEES },
      p('Optional extras, such as a rubber change, are shown with their price before you add them. We may update fees; the fees shown at checkout are the ones that apply to your order.'),
    ],
  },
  {
    title: '5. Payment',
    body: [
      list(
        'In-app payment: you pay the full amount by mobile money or card through our payment partner before a rider is sent. Your order is dispatched once payment is confirmed.',
        'Cash on delivery: you pay the rider the full total in cash when your cylinder is delivered.',
      ),
      p('Refunds for paid orders that are cancelled before collection are returned to your original payment method.'),
    ],
  },
  {
    title: '6. Safety and your cylinder',
    body: [
      list(
        'Hand over a cylinder that is yours to refill and safe to transport.',
        'Check the rider\'s name, photo and number plate in the app before handing over your cylinder.',
        'Report a damaged or leaking cylinder straight away and do not use it.',
      ),
    ],
  },
  {
    title: '7. Ratings and conduct',
    body: [
      p('You can rate each delivery and report problems. Please be respectful to riders and station staff. We may suspend accounts used for fraud, abuse or repeated false reports.'),
    ],
  },
  {
    title: '8. Problems and complaints',
    body: [p('Report a problem from the order or contact us from Help & Support. We aim to reply within 24 hours.')],
  },
];

export const PRIVACY: LegalSection[] = [
  {
    title: 'What we collect',
    body: [
      list(
        'Account details: your name, phone number, email and, if you set one, a password (stored securely, never in plain text).',
        'Location: your delivery location when you order, and your saved places (kept on your phone).',
        'Orders: what you ordered, the station, amounts, payment method, ratings and reports.',
        'Device: a notification token so we can send order updates.',
      ),
    ],
  },
  {
    title: 'How we use it',
    body: [
      list(
        'To find a rider, deliver your order and show you live tracking.',
        'To take payment and send receipts.',
        'To send order updates and answer support requests.',
        'To keep the service safe and improve it, for example from ratings and reports.',
      ),
    ],
  },
  {
    title: 'Who we share it with',
    body: [
      list(
        'Your rider: your name, phone number and delivery location, for the active order only.',
        'The filling station: the order details needed to fill your cylinder.',
        'Our payment partner: what is needed to process an in-app payment. We do not store your card or mobile money PIN.',
      ),
      p('We do not sell your personal data.'),
    ],
  },
  {
    title: 'Your choices',
    body: [
      list(
        'Update your details from Personal Information.',
        'Turn location and notifications on or off in your phone settings.',
        'Delete your account from Privacy & Security. We then delete your personal data, except records we must keep by law, such as payment records.',
      ),
    ],
  },
  {
    title: 'Contact',
    body: [p('Questions about your data? Contact us from Help & Support.')],
  },
];
