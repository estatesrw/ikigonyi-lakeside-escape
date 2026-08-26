# Ikigonyi Retreat Platform

Build a premium, modern hospitality website and property management platform for a lakeside vacation property called:

IKIGONYI ROUND HOUSE

Lake Muhazi, Rwanda

The website is being developed and managed by EstatesRW.

IMPORTANT:

This must NOT be just a marketing website. Build a complete web application with:

1. A beautiful public-facing hospitality website

2. A real booking system

3. A manager dashboard

4. Booking/calendar management

5. Lead and inquiry management

6. Event management

7. Pricing management

8. A foundation for future integration with Airbnb, Booking.com and other booking channels

9. A scalable architecture that can eventually support multiple properties managed by EstatesRW

The design should feel like a high-end private lakeside retreat, not like a generic hotel template.

==================================================

BRAND POSITIONING

==================================================

Property name:

Ikigonyi Round House

Location:

Lake Muhazi, Rwanda

Positioning:

A private lakeside retreat for families, couples, friends, small groups, private gatherings and weekend escapes from Kigali.

The property can accommodate up to 12 guests and has 4 bedrooms.

The property should be presented as:

- Private

- Peaceful

- Natural

- Stylish

- Social

- Exclusive

- A destination rather than simply accommodation

Do NOT overuse the word "luxury". The brand should feel sophisticated and authentic rather than exaggerated.

Main message:

"Escape to Lake Muhazi."

Supporting message:

"A private lakeside retreat designed for slow mornings, shared moments and unforgettable weekends."

==================================================

DESIGN DIRECTION

==================================================

Create a cinematic, editorial and premium design.

Use:

- Large immersive photography

- Elegant typography

- Generous whitespace

- Smooth subtle animations

- Minimal UI

- High-quality image cards

- Soft rounded corners

- Sophisticated transitions

- Responsive design

- Mobile-first thinking

Visual atmosphere:

- Natural

- Warm

- Earthy

- Contemporary

- Calm

Avoid:

- Generic hotel templates

- Excessive gradients

- Overly bright colors

- Excessive animations

- Crowded layouts

- Corporate-looking design

Use a restrained palette based around:

- Warm off-white

- Charcoal

- Natural earthy tones

- Muted green

- Subtle warm brown

Use placeholder images where necessary, but structure the application so real property photography can easily replace them.

==================================================

PUBLIC WEBSITE

==================================================

Create the following navigation:

Stay

Experiences

Gallery

About

Location

Primary CTA:

BOOK YOUR STAY

The navigation should remain elegant and responsive on mobile.

--------------------------------------------------

HOMEPAGE

--------------------------------------------------

Section 1: HERO

Full-screen cinematic hero image/video of the property and Lake Muhazi.

Headline:

"Escape to Lake Muhazi."

Subheadline:

"A private lakeside retreat designed for slow mornings, shared moments and unforgettable weekends."

Buttons:

"Check Availability"

"Explore Ikigonyi"

Add a subtle location indicator:

"Lake Muhazi, Rwanda"

--------------------------------------------------

SECTION 2: BOOKING SEARCH

--------------------------------------------------

Immediately below the hero, create a booking search component.

Fields:

Check-in

Check-out

Guests

Button:

"Check Availability"

When the user searches, the system should check the internal availability database.

Display:

Available

Unavailable

Price per night

Number of nights

Total price

Allow the user to continue directly to booking.

--------------------------------------------------

SECTION 3: INTRODUCTION

--------------------------------------------------

Headline:

"A private retreat by the lake."

Description:

"Ikigonyi Round House is a unique lakeside retreat on the shores of Lake Muhazi, offering a peaceful escape surrounded by nature.

Designed for families, friends, couples and small groups, Ikigonyi combines the privacy of a home with the experience of a destination getaway."

Use a large image beside the text.

--------------------------------------------------

SECTION 4: THE HOUSE

--------------------------------------------------

Create a visually rich accommodation section.

Display:

4 Bedrooms

Up to 12 Guests

Private Lakeside Setting

Fully Equipped Kitchen

Living & Social Spaces

Wi-Fi

Outdoor Spaces

Lake Experiences

CTA:

"Explore the House"

Create an accommodation detail page.

--------------------------------------------------

SECTION 5: EXPERIENCES

--------------------------------------------------

Headline:

"More than a stay."

Create experience cards:

1. Weekend Getaways

"Escape Kigali for a peaceful weekend beside the lake."

2. Lakeside BBQs

"Good food, music, friends and the lake."

3. Private Gatherings

"Birthdays, celebrations and intimate occasions."

4. Corporate Retreats

"A different environment for teams and small groups."

5. Lake Experiences

"Discover the natural beauty and activities around Lake Muhazi."

Each experience should have an image, description and inquiry CTA.

--------------------------------------------------

SECTION 6: GALLERY

--------------------------------------------------

Create a beautiful masonry-style gallery.

Categories:

House

Bedrooms

Living Spaces

Lake

Outdoor

Experiences

Images should open in a full-screen lightbox.

--------------------------------------------------

SECTION 7: WHY IKIGONYI

--------------------------------------------------

Create a minimal feature section:

Private

Peaceful

Lakeside

Group Friendly

Designed for Experiences

Close to Kigali

--------------------------------------------------

SECTION 8: LAKE MUHAZI

--------------------------------------------------

Create a section selling the destination itself.

Headline:

"Your escape from the city."

Explain that Lake Muhazi provides a peaceful alternative to Kigali for weekend escapes, gatherings and nature-focused stays.

Do not make unsupported claims about exact travel time or nearby attractions unless they are later added by the manager.

--------------------------------------------------

SECTION 9: REVIEWS

--------------------------------------------------

Create a testimonials section.

Use placeholder testimonials initially.

Build the database structure so managers can add/edit/delete reviews later.

--------------------------------------------------

SECTION 10: LOCATION

--------------------------------------------------

Create a location section with:

Lake Muhazi, Rwanda

Add an interactive map placeholder that can later be connected to Google Maps.

Include:

"Get Directions"

--------------------------------------------------

SECTION 11: FINAL BOOKING CTA

--------------------------------------------------

Large cinematic section:

"Your weekend at the lake starts here."

Button:

"Book Your Stay"

--------------------------------------------------

FOOTER

--------------------------------------------------

Include:

Ikigonyi Round House

Lake Muhazi, Rwanda

Stay

Experiences

Gallery

About

Location

Contact

WhatsApp

Email

Instagram

Booking CTA

==================================================

BOOKING SYSTEM

==================================================

This must be a REAL booking system, not a fake UI.

Create database tables/entities for:

Properties

Rooms/Accommodation

Bookings

Guests

Availability

Payments

Channels

Inquiries

Events

Pricing Rules

Reviews

Users

A booking should contain:

Booking ID

Guest name

Email

Phone

Number of guests

Check-in

Check-out

Number of nights

Nightly rate

Total amount

Booking source

Payment status

Booking status

Special requests

Created date

Booking status:

Inquiry

Pending

Confirmed

Cancelled

Completed

Payment status:

Pending

Paid

Partially Paid

Refunded

Booking sources:

Direct Website

WhatsApp

Instagram

Airbnb

Booking.com

Expedia

Other

==================================================

BOOKING FLOW

==================================================

User flow:

1. Guest selects dates

2. Guest selects number of guests

3. System checks availability

4. System calculates price

5. Guest sees booking summary

6. Guest enters contact information

7. Guest submits booking

8. Booking is created in the manager dashboard

9. Guest receives confirmation/inquiry message

10. Manager can update booking status

The architecture must allow payment integration later.

IMPORTANT:

Booking payments belong directly to the property owner/client.

EstatesRW must NOT hold or control booking funds.

Design the payment architecture so the property owner's designated payment account can be connected later.

==================================================

MANAGER DASHBOARD

==================================================

Create a secure manager login.

Dashboard should have:

Overview

Bookings

Calendar

Guests

Inquiries

Events

Pricing

Channels

Content

Reviews

Reports

Settings

--------------------------------------------------

DASHBOARD OVERVIEW

--------------------------------------------------

Show:

Today's Arrivals

Today's Departures

Upcoming Bookings

Pending Inquiries

Current Occupancy

Upcoming Events

Estimated Revenue

Booking Sources

Use clean visual cards and charts.

--------------------------------------------------

BOOKING MANAGEMENT

--------------------------------------------------

Managers can:

Create booking

Edit booking

Cancel booking

Confirm booking

View guest details

View booking source

Update payment status

Add notes

View booking history

Create filters:

All

Pending

Confirmed

Cancelled

Completed

--------------------------------------------------

CALENDAR

--------------------------------------------------

Create a professional calendar view.

Managers can see:

Booked dates

Available dates

Blocked dates

Events

Clicking a booking should open its details.

Allow managers to manually block dates.

IMPORTANT:

Prevent double booking.

The availability engine should check all confirmed bookings and blocked dates before allowing a new booking.

==================================================

INQUIRY / CRM SYSTEM

==================================================

Create a lead management section.

Fields:

Name

Phone

Email

Source

Interested dates

Guests

Estimated booking value

Status

Notes

Assigned manager

Created date

Lead statuses:

New

Contacted

Negotiating

Awaiting Payment

Confirmed

Lost

Completed

Create a simple pipeline/kanban interface.

This is important because EstatesRW will be handling digital communications and converting inquiries into bookings.

==================================================

COMMUNICATION MANAGEMENT

==================================================

Create a communication area that can later integrate with:

WhatsApp

Instagram

Email

For now, create the data architecture and interface.

Managers should be able to see:

Guest

Message

Channel

Date

Status

Assigned person

Create quick response templates such as:

Availability inquiry

Price inquiry

Booking follow-up

Payment instructions

Booking confirmation

Check-in information

Thank-you message

Do not fake WhatsApp or Instagram API integration.

Build the architecture so APIs can be connected later.

==================================================

EVENT MANAGEMENT

==================================================

Create a dedicated Events module.

Managers can create:

Event name

Event date

Event type

Number of guests

Expected revenue

Estimated costs

Vendors

Status

Notes

Event types:

BBQ

Brunch

Private Party

Birthday

Corporate Retreat

Wedding/Private Celebration

Other

Event statuses:

Planning

Confirmed

Completed

Cancelled

Show event revenue and estimated costs.

==================================================

PRICING MANAGEMENT

==================================================

Create a pricing management module.

Managers can define:

Base nightly rate

Weekend rate

High season rate

Low season rate

Holiday rate

Special event rate

Create a pricing calendar.

Allow managers to override pricing for specific dates.

The booking engine should automatically calculate the correct price based on the selected dates.

==================================================

BOOKING CHANNEL MANAGEMENT

==================================================

Create a "Channels" section.

Potential channels:

Direct Website

Airbnb

Booking.com

Expedia

Other

IMPORTANT:

Do NOT claim that Airbnb or Booking.com are already integrated.

Instead, create a channel management architecture that supports future:

API integrations

iCal synchronization

Channel manager integrations

Managers should be able to see:

Channel name

Connection status

Last synchronization

Number of bookings

Revenue

Example statuses:

Connected

Not Connected

Pending

Include buttons:

Connect

Disconnect

Sync Now

For now these buttons can show a clear "Integration coming soon" state if no real API credentials are configured.

==================================================

REPORTING

==================================================

Create a reports section showing:

Total bookings

Occupancy

Revenue

Average nightly rate

Average booking value

Booking source performance

Cancellation rate

Event revenue

Monthly performance

Create charts for:

Bookings by month

Revenue by month

Bookings by source

Occupancy by month

Do not invent financial data.

Use zero/empty states when no data exists.

==================================================

CONTENT MANAGEMENT

==================================================

Create a basic CMS inside the dashboard.

Managers should be able to update:

Homepage text

Property description

Experiences

Gallery images

Amenities

Reviews

Contact information

Social media links

This means the website content does not have to be hard-coded.

==================================================

USER ROLES

==================================================

Create role-based access.

Roles:

OWNER

ESTATESRW_MANAGER

OPERATIONS_STAFF

OWNER:

Full access including financial information and settings.

ESTATESRW_MANAGER:

Bookings

Inquiries

Communications

Marketing

Content

Calendar

Events

Pricing

Reports

OPERATIONS_STAFF:

Arrivals

Departures

Guest information

Operational notes

Cleaning/maintenance tasks

Operations staff should NOT see sensitive financial information.

==================================================

ESTATESRW ARCHITECTURE

==================================================

IMPORTANT:

Although the current property is only Ikigonyi Round House, structure the database as a multi-property system.

Create:

Properties

Property Users

Property Settings

Each property should have its own:

Bookings

Calendar

Guests

Events

Pricing

Content

Reviews

Reports

The long-term goal is for EstatesRW to manage multiple properties from one platform.

For now, Ikigonyi Round House should be the first property.

==================================================

FINANCIAL SEPARATION

==================================================

The property owner receives all booking payments directly.

EstatesRW does not receive, hold, process or control booking funds.

The dashboard can display booking values and financial reporting for management purposes, but do not create an EstatesRW wallet or payment account.

If a payment integration is later added, it must be designed so funds are routed directly to the property's designated payment account.

==================================================

TECHNICAL REQUIREMENTS

==================================================

Use a modern production-ready architecture.

Use:

React

TypeScript

Tailwind CSS

shadcn/ui

Use Supabase for:

Authentication

Database

Storage

Row-level security

Create proper database relationships.

Do NOT use fake static dashboard data.

Use real database queries.

Create loading states.

Create empty states.

Create error states.

Create success notifications.

Make the application fully responsive.

Ensure accessibility.

==================================================

SECURITY

==================================================

Implement authentication.

Use role-based authorization.

Use Supabase Row Level Security.

Users should only access properties and information they are authorized to access.

Protect guest information and financial information.

Never expose private database credentials in frontend code.

==================================================

SEO

==================================================

The public website must be strongly optimized for search.

Primary positioning:

Ikigonyi Round House

Lake Muhazi

Rwanda

Target relevant search intent such as:

Lake Muhazi accommodation

Lake Muhazi villa

Lake Muhazi vacation rental

Lake Muhazi weekend getaway

Lake Muhazi house rental

Accommodation near Lake Muhazi

Private villa Lake Muhazi

Weekend getaway from Kigali

Lake Muhazi group accommodation

Create:

SEO title

Meta description

Open Graph metadata

Structured data where appropriate

Semantic HTML

Fast loading pages

Optimized image handling

IMPORTANT:

Do not keyword-stuff the website.

==================================================

WHATSAPP

==================================================

Add floating WhatsApp CTA throughout the public website.

Use a configurable WhatsApp number in the admin settings rather than hard-coding it.

CTA:

"Chat with us"

==================================================

MOBILE EXPERIENCE

==================================================

The majority of guests may access the website from mobile devices.

Make the mobile experience excellent.

The booking flow must be extremely easy on mobile.

Use sticky booking CTA where appropriate.

==================================================

ADMIN UI DESIGN

==================================================

The dashboard should look like a professional SaaS/property-management application.

Use:

Sidebar navigation

Top header

Search

Notifications

Profile menu

Cards

Tables

Charts

Calendar

Kanban boards

Do not make the dashboard look like the public hospitality website.

Public website = premium hospitality.

Dashboard = professional SaaS.

==================================================

IMPORTANT BUSINESS LOGIC

==================================================

The system should distinguish between:

Lead

Inquiry

Booking

Confirmed Booking

Completed Booking

A lead is NOT automatically a booking.

A booking becomes confirmed only when the manager confirms it.

Availability should be blocked only according to the configured booking status rules.

Prevent overlapping confirmed bookings.

Allow manual blocked dates.

Calculate total nights automatically.

Calculate booking total automatically.

Record booking source.

Record commission information separately so EstatesRW can later track its management commission without ever receiving the guest's booking funds.

==================================================

SEED DATA

==================================================

Create Ikigonyi Round House as the initial property.

Basic information:

Name:

Ikigonyi Round House

Location:

Lake Muhazi, Rwanda

Bedrooms:

4

Maximum guests:

12

Use placeholder pricing rather than inventing final prices.

Create a few clearly marked demo records only if necessary to demonstrate the dashboard, and make it obvious that they are demo data.

==================================================

FINAL QUALITY REQUIREMENT

==================================================

The final result should feel like:

A premium lakeside retreat website + a real property-management SaaS platform.

Do not build a static mockup.

Do not create fake buttons that do nothing.

Where a third-party integration cannot yet be connected because credentials/API access are unavailable, create the correct architecture and a clear integration placeholder.

Prioritize a functional MVP with clean architecture over unnecessary visual effects.

Build the application in a way that allows EstatesRW to eventually reuse the same platform for other properties.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://ikigonyi-lakeside-escape.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/3a60aedd-683b-4e85-a292-d7e336d194d0).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
