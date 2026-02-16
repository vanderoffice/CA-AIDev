-- BizBot v4 Seed Data
-- Initial industries, agencies, and common license requirements

-- ============================================================
-- INDUSTRIES
-- ============================================================

INSERT INTO license_industries (code, name, parent_code, description, sort_order) VALUES
-- Top-level categories
('food', 'Food & Beverage', NULL, 'Restaurants, food trucks, catering, bars', 10),
('retail', 'Retail', NULL, 'General retail, online, specialty', 20),
('professional', 'Professional Services', NULL, 'Licensed professionals (CPA, attorney, etc.)', 30),
('construction', 'Construction & Trades', NULL, 'General contractors, specialty trades', 40),
('personal', 'Personal Services', NULL, 'Salon, spa, fitness, childcare', 50),
('healthcare', 'Healthcare', NULL, 'Medical, dental, pharmacy, allied health', 60),
('cannabis', 'Cannabis', NULL, 'Retail, cultivation, manufacturing, distribution', 70),
('alcohol', 'Alcohol', NULL, 'Bars, restaurants with alcohol, manufacturing', 80),
('manufacturing', 'Manufacturing', NULL, 'General, food processing, chemical', 90),
('transportation', 'Transportation & Logistics', NULL, 'Trucking, rideshare, delivery, warehouse', 100),
('other', 'Other', NULL, 'Agriculture, nonprofit, entertainment', 110),

-- Food subcategories
('food_restaurant', 'Restaurant', 'food', 'Full-service and fast-casual dining', 11),
('food_truck', 'Food Truck / Mobile', 'food', 'Mobile food facilities', 12),
('food_catering', 'Catering', 'food', 'Off-site food service', 13),
('food_bar', 'Bar / Nightclub', 'food', 'Primary alcohol service', 14),
('food_bakery', 'Bakery / Cafe', 'food', 'Bakery and coffee shop', 15),
('food_manufacturing', 'Food Manufacturing', 'food', 'Packaged food production', 16),

-- Retail subcategories
('retail_general', 'General Retail', 'retail', 'Standard retail store', 21),
('retail_online', 'Online Only', 'retail', 'E-commerce without physical storefront', 22),
('retail_tobacco', 'Tobacco / Vape', 'retail', 'Tobacco and vape products', 23),
('retail_firearms', 'Firearms', 'retail', 'Gun sales and accessories', 24),

-- Professional subcategories
('professional_accounting', 'Accounting / CPA', 'professional', 'CPA firms and bookkeeping', 31),
('professional_legal', 'Legal Services', 'professional', 'Law firms and legal services', 32),
('professional_real_estate', 'Real Estate', 'professional', 'Brokerage and agents', 33),
('professional_insurance', 'Insurance', 'professional', 'Insurance agents and brokers', 34),
('professional_engineering', 'Engineering / Architecture', 'professional', 'Design professionals', 35),

-- Construction subcategories
('construction_general', 'General Contractor', 'construction', 'General building contractor (B license)', 41),
('construction_electrical', 'Electrical', 'construction', 'Electrical contractor (C-10)', 42),
('construction_plumbing', 'Plumbing', 'construction', 'Plumbing contractor (C-36)', 43),
('construction_hvac', 'HVAC', 'construction', 'Heating and air (C-20)', 44),
('construction_roofing', 'Roofing', 'construction', 'Roofing contractor (C-39)', 45),

-- Personal services subcategories
('personal_salon', 'Salon / Barbershop', 'personal', 'Hair salon and barbershop', 51),
('personal_spa', 'Spa / Massage', 'personal', 'Day spa and massage', 52),
('personal_fitness', 'Fitness / Gym', 'personal', 'Gym and fitness studio', 53),
('personal_childcare', 'Childcare', 'personal', 'Daycare and childcare facility', 54),

-- Healthcare subcategories
('healthcare_medical', 'Medical Practice', 'healthcare', 'Physician office', 61),
('healthcare_dental', 'Dental Practice', 'healthcare', 'Dentist office', 62),
('healthcare_pharmacy', 'Pharmacy', 'healthcare', 'Retail and compounding pharmacy', 63),
('healthcare_allied', 'Allied Health', 'healthcare', 'PT, OT, chiropractic, etc.', 64),

-- Cannabis subcategories
('cannabis_retail', 'Cannabis Retail', 'cannabis', 'Dispensary / storefront', 71),
('cannabis_cultivation', 'Cannabis Cultivation', 'cannabis', 'Growing operations', 72),
('cannabis_manufacturing', 'Cannabis Manufacturing', 'cannabis', 'Extraction and edibles', 73),
('cannabis_distribution', 'Cannabis Distribution', 'cannabis', 'Transport and logistics', 74),

-- Alcohol subcategories
('alcohol_on_sale', 'On-Sale (Bar/Restaurant)', 'alcohol', 'Drinks consumed on premises', 81),
('alcohol_off_sale', 'Off-Sale (Retail)', 'alcohol', 'Package sales for off-site consumption', 82),
('alcohol_manufacturing', 'Brewery / Winery / Distillery', 'alcohol', 'Alcohol production', 83)

ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description;

-- ============================================================
-- AGENCIES
-- ============================================================

INSERT INTO license_agencies (code, name, abbreviation, url, phone, agency_type, notes) VALUES
-- Federal
('irs', 'Internal Revenue Service', 'IRS', 'https://www.irs.gov/businesses', '800-829-4933', 'federal', 'EIN, federal tax'),

-- State - Core
('sos', 'California Secretary of State', 'SOS', 'https://bizfileonline.sos.ca.gov', '916-657-5448', 'state', 'Entity formation'),
('ftb', 'Franchise Tax Board', 'FTB', 'https://www.ftb.ca.gov/businesses', '800-852-5711', 'state', 'State income tax'),
('edd', 'Employment Development Department', 'EDD', 'https://edd.ca.gov/employers', '888-745-3886', 'state', 'Payroll taxes'),
('cdtfa', 'CA Dept of Tax and Fee Administration', 'CDTFA', 'https://cdtfa.ca.gov', '800-400-7115', 'state', 'Sales tax, special taxes'),

-- State - Professional Licensing
('dca', 'Department of Consumer Affairs', 'DCA', 'https://www.dca.ca.gov', '800-952-5210', 'state', 'Professional licensing umbrella'),
('cslb', 'Contractors State License Board', 'CSLB', 'https://www.cslb.ca.gov', '800-321-2752', 'state', 'Contractor licenses'),
('dre', 'Department of Real Estate', 'DRE', 'https://www.dre.ca.gov', '877-373-4542', 'state', 'Real estate licenses'),
('cdi', 'CA Department of Insurance', 'CDI', 'https://www.insurance.ca.gov', '800-927-4357', 'state', 'Insurance licenses'),
('cba', 'CA Board of Accountancy', 'CBA', 'https://www.dca.ca.gov/cba', '916-263-3680', 'state', 'CPA licenses'),
('calbar', 'State Bar of California', 'CALBAR', 'https://www.calbar.ca.gov', '800-843-9053', 'state', 'Attorney licenses'),
('bbc', 'Board of Barbering and Cosmetology', 'BBC', 'https://www.barbercosmo.ca.gov', '800-952-5210', 'state', 'Salon licenses'),
('camtc', 'CA Massage Therapy Council', 'CAMTC', 'https://www.camtc.org', '916-669-5336', 'state', 'Massage certification'),

-- State - Industry Regulators
('abc', 'Dept of Alcoholic Beverage Control', 'ABC', 'https://www.abc.ca.gov', '916-419-2500', 'state', 'Alcohol licenses'),
('dcc', 'Department of Cannabis Control', 'DCC', 'https://cannabis.ca.gov', '844-612-2322', 'state', 'Cannabis licenses'),
('cdph', 'CA Dept of Public Health', 'CDPH', 'https://www.cdph.ca.gov', '916-558-1784', 'state', 'Health permits, food processing'),
('cdss', 'CA Dept of Social Services', 'CDSS', 'https://www.cdss.ca.gov', '916-651-8848', 'state', 'Childcare licensing'),

-- State - Environmental
('swrcb', 'State Water Resources Control Board', 'SWRCB', 'https://www.waterboards.ca.gov', '916-341-5250', 'state', 'Water permits'),
('carb', 'CA Air Resources Board', 'CARB', 'https://ww2.arb.ca.gov', '800-242-4450', 'state', 'Air quality'),
('dtsc', 'Dept of Toxic Substances Control', 'DTSC', 'https://dtsc.ca.gov', '800-728-6942', 'state', 'Hazardous waste'),
('calosha', 'Cal/OSHA', 'CAL/OSHA', 'https://www.dir.ca.gov/dosh', '844-522-6734', 'state', 'Workplace safety'),

-- State - Healthcare
('mbc', 'Medical Board of California', 'MBC', 'https://www.mbc.ca.gov', '800-633-2322', 'state', 'Physician licenses'),
('brn', 'Board of Registered Nursing', 'BRN', 'https://www.rn.ca.gov', '916-322-3350', 'state', 'Nursing licenses'),
('dbc', 'Dental Board of California', 'DBC', 'https://www.dbc.ca.gov', '916-263-2300', 'state', 'Dentist licenses'),
('bop', 'CA Board of Pharmacy', 'BOP', 'https://www.pharmacy.ca.gov', '916-574-7900', 'state', 'Pharmacy licenses'),

-- Local (generic - specific cities/counties populated separately)
('local_city', 'City Business License Office', NULL, NULL, NULL, 'city', 'City-specific business license'),
('local_county', 'County Business License Office', NULL, NULL, NULL, 'county', 'County-specific business license'),
('local_health', 'Local Health Department', NULL, NULL, NULL, 'county', 'Health permits, food facility'),
('local_fire', 'Local Fire Department', NULL, NULL, NULL, 'city', 'Fire permits, inspections'),
('local_planning', 'Local Planning Department', NULL, NULL, NULL, 'city', 'Zoning, land use permits'),
('local_aqmd', 'Local Air Quality Management District', 'AQMD', NULL, NULL, 'special_district', 'Air permits'),

-- County-level agencies (added Phase 7)
('county_clerk', 'County Clerk', 'CC', NULL, NULL, 'county', 'Fictitious business name filings'),
('county_assessor', 'County Assessor', 'CA', 'https://www.boe.ca.gov/proptaxes/bpp.htm', NULL, 'county', 'Business personal property assessments')

ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    url = EXCLUDED.url,
    phone = EXCLUDED.phone;

-- ============================================================
-- COMMON LICENSE REQUIREMENTS
-- ============================================================

-- Universal requirements (all businesses)
INSERT INTO license_requirements (
    license_name, license_code, agency_code, industry_code,
    sequence_order, sequence_group,
    application_fee_min, application_fee_max,
    processing_days_min, processing_days_max,
    application_url, info_url, notes
) VALUES
-- Entity Formation (applies to all non-sole-proprietor)
('LLC Articles of Organization', 'LLC', 'sos', 'other',
 1, 'formation', 70, 70, 1, 10,
 'https://bizfileonline.sos.ca.gov', 'https://www.sos.ca.gov/business-programs/business-entities/forming-llc',
 'Required for all LLCs. $70 fee. Can expedite for additional $350.'),

('Corporation Articles of Incorporation', 'CORP', 'sos', 'other',
 1, 'formation', 100, 100, 1, 10,
 'https://bizfileonline.sos.ca.gov', 'https://www.sos.ca.gov/business-programs/business-entities/forming-corporation',
 'Required for all corporations. $100 fee.'),

('Employer Identification Number (EIN)', 'EIN', 'irs', 'other',
 2, 'formation', 0, 0, 0, 0,
 'https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online',
 'https://www.irs.gov/businesses/small-businesses-self-employed/employer-id-numbers',
 'Free. Required for all entities except sole proprietors with no employees. Apply online for immediate issuance.'),

('Statement of Information', 'SOI', 'sos', 'other',
 5, 'formation', 20, 25, 0, 0,
 'https://bizfileonline.sos.ca.gov', 'https://www.sos.ca.gov/business-programs/business-entities/statement-information',
 'Due within 90 days of formation for LLCs ($20), Corps ($25). Then biennial.');

-- State Tax Registrations
INSERT INTO license_requirements (
    license_name, license_code, agency_code, industry_code,
    sequence_order, sequence_group, is_conditional, condition_description,
    application_fee_min, application_fee_max,
    processing_days_min, processing_days_max,
    application_url, notes
) VALUES
('Seller''s Permit', 'SELLER', 'cdtfa', 'retail',
 20, 'state', false, NULL,
 0, 0, 0, 0,
 'https://onlineservices.cdtfa.ca.gov',
 'Free. Required if selling tangible goods. Security deposit may be required.'),

('Employer Registration', 'EMPACCT', 'edd', 'other',
 21, 'state', true, 'Required if you have employees',
 0, 0, 7, 14,
 'https://eddservices.edd.ca.gov/tap/secure/eservices',
 'Required within 20 days of first employee. Register online at e-Services.');

-- Food Service Licenses
INSERT INTO license_requirements (
    license_name, license_code, agency_code, industry_code,
    sequence_order, sequence_group,
    application_fee_min, application_fee_max,
    processing_days_min, processing_days_max,
    application_url, info_url, notes
) VALUES
('Health Permit (Food Facility)', 'HEALTH', 'local_health', 'food_restaurant',
 60, 'industry', 400, 1500, 14, 60,
 NULL, 'https://www.cdph.ca.gov/Programs/CEH/DFDCS/Pages/FDBPrograms/FoodSafetyProgram.aspx',
 'Fee varies by county. Plan review required. Food handler cards for all employees.'),

('Mobile Food Facility Permit', 'MFF', 'local_health', 'food_truck',
 60, 'industry', 500, 2000, 30, 90,
 NULL, 'https://www.cdph.ca.gov/Programs/CEH/DFDCS/Pages/FDBPrograms/MobileFoodFacilities.aspx',
 'Requires commissary agreement. Annual permit. Varies significantly by county.'),

('Processed Food Registration', 'PFR', 'cdph', 'food_manufacturing',
 61, 'industry', 0, 0, 14, 30,
 'https://www.cdph.ca.gov/Programs/CEH/DFDCS/Pages/FDBPrograms/FoodSafetyProgram/ProcessedFoodRegistration.aspx',
 NULL, 'Required for food manufacturing. No fee but must register.');

-- Retail Licenses
INSERT INTO license_requirements (
    license_name, license_code, agency_code, industry_code,
    sequence_order, sequence_group,
    application_fee_min, application_fee_max,
    processing_days_min, processing_days_max,
    application_url, notes
) VALUES
('Tobacco Retail License', 'TOBACCO', 'cdtfa', 'retail_tobacco',
 60, 'industry', 265, 265, 14, 30,
 'https://onlineservices.cdtfa.ca.gov',
 '$265/year. Required before selling tobacco products. Local permit also required.');

-- Construction Licenses
INSERT INTO license_requirements (
    license_name, license_code, agency_code, industry_code,
    sequence_order, sequence_group,
    application_fee_min, application_fee_max,
    processing_days_min, processing_days_max,
    application_url, info_url, notes
) VALUES
('General Contractor License (B)', 'CSLB-B', 'cslb', 'construction_general',
 60, 'industry', 450, 450, 60, 120,
 'https://www.cslb.ca.gov/Applicants/', 'https://www.cslb.ca.gov/Applicants/HowToApply/',
 'Requires 4 years experience, exam, $25k bond. Application $450 + exam fees.'),

('Electrical Contractor License (C-10)', 'CSLB-C10', 'cslb', 'construction_electrical',
 60, 'industry', 450, 450, 60, 120,
 'https://www.cslb.ca.gov/Applicants/', NULL,
 'Requires 4 years experience, exam, $25k bond. C-10 classification.');

-- Alcohol Licenses
INSERT INTO license_requirements (
    license_name, license_code, agency_code, industry_code,
    sequence_order, sequence_group,
    application_fee_min, application_fee_max,
    processing_days_min, processing_days_max,
    application_url, info_url, notes
) VALUES
('Type 47 - On-Sale General (Restaurant)', 'ABC-47', 'abc', 'alcohol_on_sale',
 60, 'industry', 15000, 15000, 60, 180,
 'https://www.abc.ca.gov/licensing/apply-for-a-license/', 'https://www.abc.ca.gov/licensing/license-types/license-fees/',
 'Full alcohol service in bona fide eating place. Person-to-person transfer or public premises.'),

('Type 41 - On-Sale Beer & Wine (Restaurant)', 'ABC-41', 'abc', 'alcohol_on_sale',
 60, 'industry', 740, 740, 45, 90,
 'https://www.abc.ca.gov/licensing/apply-for-a-license/', NULL,
 'Beer and wine only. Lower fee than Type 47. Bona fide eating place required.'),

('Type 21 - Off-Sale General', 'ABC-21', 'abc', 'alcohol_off_sale',
 60, 'industry', 18000, 18000, 60, 180,
 'https://www.abc.ca.gov/licensing/apply-for-a-license/', NULL,
 'Full alcohol retail sales. Package store. Limited licenses available.');

-- Cannabis Licenses
INSERT INTO license_requirements (
    license_name, license_code, agency_code, industry_code,
    sequence_order, sequence_group,
    application_fee_min, application_fee_max, annual_fee_min, annual_fee_max,
    processing_days_min, processing_days_max,
    application_url, info_url, notes
) VALUES
('Cannabis Retail License (Type 10)', 'DCC-10', 'dcc', 'cannabis_retail',
 65, 'industry', 1000, 1000, 5000, 120000, 90, 180,
 'https://online.bcc.ca.gov', 'https://cannabis.ca.gov/applicants/how-to-apply-for-a-license/',
 'CRITICAL: Local approval required FIRST. Annual fee based on gross revenue.'),

('Cannabis Cultivation License (Small)', 'DCC-CULT-S', 'dcc', 'cannabis_cultivation',
 65, 'industry', 1205, 1205, 2410, 4820, 60, 90,
 'https://online.bcc.ca.gov', NULL,
 'For ≤5,000 sq ft canopy. Requires local approval, water rights, CEQA compliance.'),

('Cannabis Manufacturing License (Type 6)', 'DCC-MFG-6', 'dcc', 'cannabis_manufacturing',
 65, 'industry', 2000, 2000, 5000, 50000, 60, 90,
 'https://online.bcc.ca.gov', NULL,
 'Non-volatile extraction (CO2, ethanol). Requires local approval.');

-- Healthcare Licenses
INSERT INTO license_requirements (
    license_name, license_code, agency_code, industry_code,
    sequence_order, sequence_group,
    application_fee_min, application_fee_max,
    processing_days_min, processing_days_max,
    application_url, notes
) VALUES
('Pharmacy License', 'PHARM', 'bop', 'healthcare_pharmacy',
 60, 'industry', 570, 570, 90, 180,
 'https://www.pharmacy.ca.gov/applicants/index.shtml',
 'Requires PIC (Pharmacist-in-Charge), site inspection, extensive documentation.');

-- Personal Services Licenses
INSERT INTO license_requirements (
    license_name, license_code, agency_code, industry_code,
    sequence_order, sequence_group,
    application_fee_min, application_fee_max,
    processing_days_min, processing_days_max,
    application_url, notes
) VALUES
('Establishment License (Salon)', 'BBC-EST', 'bbc', 'personal_salon',
 60, 'industry', 50, 50, 14, 30,
 'https://www.barbercosmo.ca.gov/applicants/establishment.shtml',
 'Required for all salons and barbershops. Must have licensed operators.'),

('Childcare License (Center)', 'CCLD', 'cdss', 'personal_childcare',
 60, 'industry', 200, 500, 90, 180,
 'https://www.cdss.ca.gov/inforesources/community-care-licensing/child-care',
 'Extensive requirements. Fire clearance, health screening, background checks, training.');

-- General/Cross-Industry Requirements (Phase 7 expansion)
-- These apply to most/all CA businesses regardless of industry
INSERT INTO license_requirements (
    license_name, license_code, agency_code, industry_code,
    sequence_order, sequence_group, is_conditional, condition_description,
    application_fee_min, application_fee_max,
    application_url, info_url, notes
) VALUES
('Fictitious Business Name Statement (DBA)', 'dba_statement', 'county_clerk', 'general',
 15, 'formation', true, 'Required when operating under a name other than your legal name',
 10, 50,
 NULL, 'https://www.sos.ca.gov/business-programs/business-entities/statements',
 'Must also publish in local newspaper ($30-$100). Filed with county clerk. Expires after 5 years.'),

('Statement of Information (SOS Filing)', 'soi_filing', 'sos', 'general',
 80, 'ongoing', true, 'Required for LLCs (biennial) and Corporations (annual); not required for sole proprietorships',
 20, 25,
 'https://bizfileonline.sos.ca.gov/', 'https://www.sos.ca.gov/business-programs/business-entities/statements',
 'LLC: due within 90 days of formation, then biennial. Corp: due within 90 days, then annual.'),

('Business Personal Property Statement (BOE-571-L)', 'bpp_statement', 'county_assessor', 'general',
 85, 'ongoing', true, 'Required for businesses with assessable personal property (equipment, fixtures, supplies)',
 0, 0,
 NULL, 'https://www.boe.ca.gov/proptaxes/bpp.htm',
 'Filed annually with county assessor by April 1. Covers furniture, equipment, computers, supplies. Late filing penalty: 10% of assessed value.');

-- Copy universal requirements to all industries
-- This ensures every industry inherits the formation basics
-- Done via application logic, not database triggers

COMMENT ON TABLE license_requirements IS 'Seed data - expand with city-specific and additional industry requirements';
