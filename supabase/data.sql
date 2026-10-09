SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict Fx0bvopbEi47bunJtEVeaTr3CbI6fNssdaN5cD91FQRa347CDZDLNE4xciU1VQE

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_recovery_code_sets; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_recovery_codes; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: scim_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: scim_users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: webauthn_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: webauthn_credentials; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: app_passwords; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."app_passwords" ("key", "password", "updated_at") VALUES
	('staff_password', 'VyomaPOS2026', '2026-08-20 16:22:31.275655+00'),
	('admin_password', 'VyomaPOS2026', '2026-08-20 16:22:31.275655+00');


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."customers" ("phone", "name", "order_count", "created_at", "gstin", "loyal_vip", "discount") VALUES
	('+91 99224 41812', 'Shravan Bhokase', 22, '2026-09-01 11:27:45.027168+00', NULL, false, 10),
	('91+87883766', 'Shravan b', 4, '2026-09-20 18:18:42.922+00', NULL, false, 10),
	('+91 87883 76667', 'Shravan b', 3, '2026-10-06 16:29:21.868+00', NULL, false, 0),
	('+918788376667', 'Shravan b', 5, '2026-09-21 11:58:20.857+00', NULL, false, 10),
	('+91 97654 88990', 'Pooja Deshmukh', 2, '2026-08-22 19:55:51.235754+00', NULL, false, NULL),
	('+91 99887 66554', 'Karan Mehra', 2, '2026-08-22 19:55:55.251921+00', NULL, false, NULL),
	('+91 91234 98765', 'Ananya Iyer', 2, '2026-08-22 19:55:59.248164+00', NULL, false, NULL),
	('+91 9876543210', 'Aarav Sharma', 2, '2026-08-12 18:15:32.438299+00', NULL, false, NULL),
	('+919890123456', 'Ananya Deshmukh', 1, '2026-08-13 10:08:23.852224+00', NULL, false, NULL),
	('+919765432109', 'Rohan Kulkarni', 2, '2026-08-13 10:08:23.852224+00', NULL, false, NULL),
	('+91 9730011223', 'Vikram Joshi', 1, '2026-08-13 10:10:45.232514+00', NULL, false, NULL),
	('+919988776655', 'Aditya Verma', 1, '2026-08-13 10:08:23.852224+00', NULL, false, NULL),
	('+919811223344', 'Sneha Patel', 1, '2026-08-13 10:08:23.852224+00', NULL, false, NULL),
	('+919812345678', 'Priya Nair', 1, '2026-08-16 19:18:56.115+00', NULL, false, NULL),
	('+919730011223', 'Vikram Joshi', 2, '2026-08-13 10:08:23.852224+00', NULL, false, NULL),
	('+919654321098', 'Tanvi Mehta', 1, '2026-08-13 10:08:23.852224+00', NULL, false, NULL),
	('Masked Number', 'Kavita Sharma', 6, '2026-08-19 06:35:35.63+00', NULL, false, NULL),
	('+919123456789', 'Rohan Gupta', 2, '2026-08-13 10:08:23.852224+00', '27AAAAA0000A1Z5', false, NULL),
	('+91 98200 12345', 'Arjun Mehta', 1, '2026-08-16 19:00:55.854+00', NULL, false, NULL),
	('+91 9922441812', 'Shravan', 24, '2026-10-06 16:02:57.787+00', '57AgACR5054K1b6', false, 0),
	('+91 7040202269', 'Anish', 10, '2026-08-13 11:34:34.70845+00', NULL, false, NULL),
	('+91 9158915956', 'Anay Deshpande', 0, '2026-09-01 10:11:03.602718+00', NULL, false, NULL),
	('+91 8783 76667', 'Shravan', 1, '2026-09-16 00:40:26.954+00', NULL, false, NULL),
	('91+ 87883 76667', 'Shravan b', 12, '2026-09-04 13:09:31.072+00', NULL, false, NULL),
	('+919988112244', 'Lord Somnath Sterling', 0, '2026-09-20 18:23:56.377701+00', NULL, false, NULL),
	('+919876543210', 'Sarah Lin', 21, '2026-08-13 14:08:37.562+00', NULL, false, NULL),
	('+91 98450 11223', 'Vikramaditya Roy', 19, '2026-08-17 11:33:09.369+00', NULL, false, 10);


--
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."expenses" ("id", "created_at", "amount", "category", "notes", "receipt_url") VALUES
	('88ba3a3f-afde-487d-b3a4-6fec0bcc3765', '2026-10-05 17:52:39.6742+00', 500.00, 'Vegetables', 'dgcv bdx', 'https://orashnrwlkdsgkfmmwtw.supabase.co/storage/v1/object/public/receipts/1791222758094_ja7kxc.pdf'),
	('12b80033-1a6b-4105-af55-df8c85a48154', '2026-10-05 17:56:16.740531+00', 555.00, 'Vegetables', 'sagv', 'https://orashnrwlkdsgkfmmwtw.supabase.co/storage/v1/object/public/receipts/1791222973799_3dp28j.webp'),
	('53b12476-16c5-4c09-9388-0370a0152a1f', '2026-10-05 18:03:27.168424+00', 250.00, 'Dairy & Vegetables', 'Amul Milk Vendor', ''),
	('6478fda9-0c2b-4e7a-affe-292614c357e3', '2026-10-05 18:04:03.55171+00', 124.00, 'Vegetables', 'safhv', 'https://orashnrwlkdsgkfmmwtw.supabase.co/storage/v1/object/public/receipts/1791223442132_h8tmde.webp'),
	('1b62badf-e7b4-4185-8fcf-3fe4d0096cfa', '2026-10-05 18:05:46.768664+00', 2324.00, 'Vegetables', 'eatgd', 'https://orashnrwlkdsgkfmmwtw.supabase.co/storage/v1/object/public/receipts/1791223544983_n72xk1.pdf');


--
-- Data for Name: menu_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."menu_items" ("id", "name", "description", "price", "category", "image", "is_sold_out", "created_at", "discount_price") VALUES
	('f4d5501c-d286-4123-8b54-d19ab4342f87', 'Heritage Brew Tea', 'Strong, aromatic traditional coffee.', 120.00, 'HOT BEVERAGES', 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500', false, '2026-08-12 18:19:48.487898+00', NULL),
	('4f70b108-a4d3-422b-aa6f-7d2bd338aad6', 'Hot Coffee', 'Classic hot coffee made with rich beans.', 140.00, 'HOT BEVERAGES', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500', false, '2026-08-12 18:19:48.487898+00', NULL),
	('d58c9c8f-cb74-4263-9b23-6b705ea941b9', 'Black Hot Americano', 'Bold espresso diluted with hot water.', 150.00, 'HOT BEVERAGES', 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=500', false, '2026-08-12 18:19:48.487898+00', NULL),
	('0bbb1a3b-f9c0-4fa1-8139-452a351b0067', 'Hot Chocolate', 'Creamy & comforting classic hot chocolate.', 180.00, 'HOT BEVERAGES', 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=500', false, '2026-08-12 18:19:48.487898+00', NULL),
	('c45709c4-1659-4d0b-a9f1-08d00b438c33', 'Hazelnut Hot Chocolate', 'Smooth hot chocolate with hazelnut flavor.', 210.00, 'HOT BEVERAGES', 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500', false, '2026-08-12 18:19:48.487898+00', NULL),
	('5605e7c1-48d0-4fa5-8300-c5b0ad0d8bcc', 'Guava Mojito', 'Refreshing guava with mint & lime.', 220.00, 'MOCKTAILS', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500', false, '2026-08-12 18:19:48.487898+00', NULL),
	('cb28b39b-e939-4f9e-bcba-a795bcabf04a', 'Watermelon Caipiroska', 'Sweet watermelon with a citrus twist.', 230.00, 'MOCKTAILS', 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=500', false, '2026-08-12 18:19:48.487898+00', NULL),
	('f3b7cbea-cef8-4536-8fce-ee0fce03c0f4', 'Mojito Crescendo', 'Classic mojito with an extra zing.', 210.00, 'MOCKTAILS', 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500', false, '2026-08-12 18:19:48.487898+00', NULL),
	('52fe22fa-18d4-4662-9cf3-9ffa749bd844', 'Blue Sunset', 'Blue curaçao notes with citrus & soda.', 240.00, 'MOCKTAILS', 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=500', false, '2026-08-12 18:19:48.487898+00', NULL),
	('c97f7544-9e96-474e-986c-117c41fdb04a', 'Skyline Spark (Red Bull)', 'Sparkling blend of fruits & lime.', 280.00, 'MOCKTAILS', 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=500', false, '2026-08-12 18:19:48.487898+00', NULL),
	('f821f19d-6365-4a44-a195-1224212a63f0', 'Frosted Coffee Shake', 'Icy coffee shake for coffee lovers.', 220.00, 'SIGNATURE SHAKES', 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500', false, '2026-08-12 18:19:48.487898+00', NULL),
	('f829a89c-9d2a-4645-a5fc-5daedaccb4f0', 'Hazelnut Frosted Shake', 'Hazelnut coffee blended smooth.', 240.00, 'SIGNATURE SHAKES', 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=500', false, '2026-08-12 18:19:48.487898+00', NULL),
	('f5513a1c-a095-485b-a096-c76439ca676e', 'Vanilla Butternut Shake', 'Rich vanilla with crunchy butternut.', 230.00, 'SIGNATURE SHAKES', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500', false, '2026-08-12 18:19:48.487898+00', NULL),
	('284775ba-6d94-4bee-980c-09b053e21f44', 'Mango Butternut Shake', 'Mango delight with butternut crunch.', 240.00, 'SIGNATURE SHAKES', 'https://images.unsplash.com/photo-1623065422902-30a2d299bcc4?w=500', false, '2026-08-12 18:19:48.487898+00', NULL),
	('d9586c70-2e47-45dd-89bf-d5f8fea6aa9b', 'Coffee Chocolate Shake', 'Blend of coffee & chocolate goodness.', 230.00, 'SIGNATURE SHAKES', 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=500', false, '2026-08-12 18:19:48.487898+00', NULL),
	('52340622-511b-467c-bfae-3dec286cc77c', 'Chocolate Blueberry Shake', 'Chocolate meets fruity blueberry.', 250.00, 'SIGNATURE SHAKES', 'https://images.unsplash.com/photo-1553787499-6f9133860278?w=500', false, '2026-08-12 18:19:48.487898+00', NULL),
	('35ee28c7-b68e-41ed-8495-a842d936206e', 'Tiramisu Classic Shake', 'Tiramisu flavor in a creamy shake.', 260.00, 'SIGNATURE SHAKES', 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=500', false, '2026-08-12 18:19:48.487898+00', NULL),
	('3b37ad71-c39c-43f1-859d-b8efc975c9ff', 'Italian Margherita', 'Classic cheese & tomato delight.', 320.00, 'PIZZA', 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500', false, '2026-08-12 18:19:48.487898+00', NULL),
	('5aedef07-a58d-458c-8407-f96ec202907e', 'Tandoori Paneer Tikka Pizza', 'Paneer tikka with tandoori spices.', 380.00, 'PIZZA', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500', false, '2026-08-12 18:19:48.487898+00', NULL),
	('20577542-b750-45be-8433-5814ed3e555f', 'Exotic Italian Farm Pizza', 'Fresh veggies with Italian herbs.', 390.00, 'PIZZA', 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500', false, '2026-08-12 18:19:48.487898+00', NULL),
	('ba4127ec-0343-4b94-a2c8-4c53b607793a', 'Gourmet Veggie Delight', 'Loaded with gourmet vegetables.', 410.00, 'PIZZA', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500', false, '2026-08-12 18:19:48.487898+00', NULL),
	('e9d8357b-84bd-4786-87e5-2c233c32a3c7', 'Wild Mushroom Pizza', 'Rich mushrooms with cheese.', 420.00, 'PIZZA', 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=500', false, '2026-08-12 18:19:48.487898+00', NULL),
	('06ed8b6a-0891-495c-a6d8-3312fa19cde8', 'Fresh Farm Pizza', 'Freshly handpicked vegetables.', 370.00, 'PIZZA', 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=500', false, '2026-08-12 18:19:48.487898+00', NULL),
	('81949977-ca6f-413e-af7d-57f37690dffd', 'Chicken Margherita', 'Classic chicken & cheese pizza.', 420.00, 'PIZZA', 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=500', false, '2026-08-12 18:19:48.487898+00', NULL),
	('e637a102-dfb3-4d11-bbd0-0f926a75f2b7', 'Chicken Tandoori Tikka Pizza', 'Tandoori chicken with onion & capsicum.', 460.00, 'PIZZA', 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=500', false, '2026-08-12 18:19:48.487898+00', NULL),
	('e296c736-cda5-4335-81b4-059ad6d0b3f0', 'Chicken Farm Fresh Pizza', 'Fresh chicken & crisp veggies.', 450.00, 'PIZZA', 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500', false, '2026-08-12 18:19:48.487898+00', NULL),
	('5d718ecb-d4ac-404a-abbd-e2872f77b173', 'Chicken Exotic Pizza', 'Exotic toppings with chicken.', 480.00, 'PIZZA', 'https://images.unsplash.com/photo-1576458088443-04a19bb13da6?w=500', false, '2026-08-12 18:19:48.487898+00', NULL),
	('2fbe41fd-bfcf-45b8-a9d9-9e83b31cd20a', 'Chicken Gourmet Delight', 'Premium chicken & gourmet toppings.', 490.00, 'PIZZA', 'https://images.unsplash.com/photo-1511688878353-3a2f5be94cd7?w=500', false, '2026-08-12 18:19:48.487898+00', NULL),
	('d7caa9a7-5a08-454e-8d30-eb6b17c977eb', 'Chicken Wild Mushroom Pizza', 'Chicken & wild mushroom delight.', 490.00, 'PIZZA', 'https://images.unsplash.com/photo-1588315029754-2dd089d39a1a?w=500', false, '2026-08-12 18:19:48.487898+00', NULL),
	('c574ce98-50e4-4023-b16d-a2de1da0c554', 'Chicken Pesto Pizza', 'Pesto sauce with grilled chicken.', 470.00, 'PIZZA', 'https://images.unsplash.com/photo-1520201163981-8cc95007dd2a?w=500', false, '2026-08-12 18:19:48.487898+00', NULL),
	('6a005377-56f0-4926-8cb9-4a475045f20d', 'Veg Herb Delight Burger', 'Herby veg patty with fresh veggies.', 220.00, 'BURGERS', 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500', false, '2026-08-12 18:19:48.487898+00', NULL),
	('c9c0651f-b2c8-4fcf-a792-3806cfbc575d', 'Crunchy Royale Burger', 'Crispy patty with special sauce.', 250.00, 'BURGERS', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500', false, '2026-08-12 18:19:48.487898+00', NULL),
	('2392fa5d-8de3-428d-a31f-1d82bec91fd1', 'Xtra Stack Burger', 'Double-layered indulgent burger.', 290.00, 'BURGERS', 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500', false, '2026-08-12 18:19:48.487898+00', NULL),
	('c7745ec2-4332-42e1-9688-d3abb6ee3b63', 'Grilled Chicken Burger', 'Grilled chicken with fresh veggies.', 280.00, 'BURGERS', 'https://images.unsplash.com/photo-1615297928064-24977384d0da?w=500', false, '2026-08-12 18:19:48.487898+00', NULL),
	('faade783-ec12-418c-9226-ff63441569e8', 'Xtra Loaded Stack Burger', 'Loaded chicken burger with signature sauce.', 340.00, 'BURGERS', 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=500', false, '2026-08-12 18:19:48.487898+00', NULL),
	('425fe1d3-5570-4bd8-bbe6-dcc7eeb76541', 'Cheese Corn Balls', 'Crispy balls with cheesy corn.', 200.00, 'CONTINENTAL STARTERS', 'https://images.unsplash.com/photo-1541529086526-db283c563270?w=500', false, '2026-08-12 18:19:48.487898+00', NULL),
	('4b797755-7bd9-4d2c-8d2c-746af0306bad', 'Jalapeño Cheese Corn Balls', 'Jalapeño & cheese stuffed balls.', 220.00, 'CONTINENTAL STARTERS', 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500', false, '2026-08-12 18:19:48.487898+00', NULL),
	('f628f564-94ac-454d-8710-7829f6f247e1', 'Cheese Cherry Pineapple Skewers', 'Cheese with cherry & pineapple.', 180.00, 'CONTINENTAL STARTERS', 'https://images.unsplash.com/photo-1599321955726-e048426594af?w=500', false, '2026-08-12 18:19:48.487898+00', NULL),
	('1cb88570-dbfe-41b2-969c-dabf31c14b1a', 'Fish Fingers', 'Crispy fish finger strips.', 300.00, 'CONTINENTAL STARTERS', 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500', false, '2026-08-12 18:19:48.487898+00', NULL),
	('e44d523e-7b97-480c-bb56-e4f03f71e64d', 'Fish & Chips', 'Crispy fish served with fries.', 350.00, 'CONTINENTAL STARTERS', 'https://images.unsplash.com/photo-1579208030886-b937da0925dc?w=500', false, '2026-08-12 18:19:48.487898+00', NULL),
	('4d0393c8-3f29-4cd6-9596-8c9f5464797a', 'Hot Marinated Chicken', 'Spicy marinated chicken bites.', 250.00, 'CONTINENTAL STARTERS', 'https://images.unsplash.com/photo-1562967914-608f82629710?w=500', false, '2026-08-12 18:19:48.487898+00', NULL),
	('c12f935d-f4fe-44ed-b840-d3e485d68f89', 'Veg Caesar Salad', 'Fresh lettuce with Caesar dressing.', 180.00, 'SALADS', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500', false, '2026-08-12 18:19:48.487898+00', NULL),
	('93558c2b-32fa-4c6b-959d-dcb2e274a6cd', 'Veg Coleslaw Salad', 'Crunchy veggies with creamy dressing.', 220.00, 'SALADS', 'https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?w=500', false, '2026-08-12 18:19:48.487898+00', NULL),
	('210500bf-1d7a-4235-8e6c-e6454426064d', 'Smoked Chicken Salad', 'Smoked chicken with fresh greens.', 280.00, 'SALADS', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500', false, '2026-08-12 18:19:48.487898+00', NULL),
	('a76414b9-d5af-49d6-acf2-38c37ec6ec92', 'Baked Vegetables', 'Oven-baked mixed vegetables.', 250.00, 'MAIN COURSE', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500', false, '2026-08-12 18:19:48.487898+00', NULL),
	('38c414be-11d7-434e-a38a-882bdc975f5c', 'Grilled Chicken Mushroom', 'Grilled chicken with mushroom sauce.', 300.00, 'MAIN COURSE', 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=500', false, '2026-08-12 18:19:48.487898+00', NULL),
	('5b0747f6-f5bf-4b48-99e2-f2257706abb7', 'Cheesecake', 'Smooth & creamy cheesecake slice.', 150.00, 'DESSERTS', 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500', false, '2026-08-12 18:19:48.487898+00', NULL),
	('1f52ed9a-f69c-42e4-94b6-241943f85aa9', 'Tiramisu', 'Classic Italian dessert with coffee layers.', 250.00, 'DESSERTS', 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500', false, '2026-08-12 18:19:48.487898+00', NULL),
	('d92ebf92-5c15-45c0-89f4-bfea8ca71650', 'Lava Cake', 'Warm chocolate cake with molten center.', 280.00, 'DESSERTS', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500', false, '2026-08-12 18:19:48.487898+00', NULL),
	('dbb68ce3-e72d-40c7-b6b8-5c062e7a0c7b', 'Alfredo Pasta', 'Creamy white sauce pasta.', 290.00, 'PASTA', 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=500', false, '2026-08-12 18:19:48.487898+00', NULL),
	('32f85bb3-c382-49f0-892d-681c37dd0a17', 'Arrabbiata Pasta', 'Spicy tomato-based pasta.', 280.00, 'PASTA', 'https://images.unsplash.com/photo-1621996346565-e3def6164286?w=500', false, '2026-08-12 18:19:48.487898+00', NULL),
	('64148628-e192-4f71-b450-25b875d3fe49', 'Mac & Cheese', 'Cheesy & creamy pasta.', 270.00, 'PASTA', 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=500', false, '2026-08-12 18:19:48.487898+00', NULL),
	('9a90316e-0329-4d6b-b541-7d4b4e48439a', 'Pesto Pasta', 'Pasta in fresh basil pesto.', 310.00, 'PASTA', 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=500', false, '2026-08-12 18:19:48.487898+00', NULL),
	('dba1e8c0-890c-4803-af8f-d95b813188c6', 'Aglio Olio', 'Olive oil, garlic & herbs pasta.', 290.00, 'PASTA', 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500', false, '2026-08-12 18:19:48.487898+00', NULL),
	('a591156c-96c4-46e1-a89d-78be2a279fa6', 'Chicken Alfredo', 'Creamy white sauce with chicken.', 350.00, 'PASTA', 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=500', false, '2026-08-12 18:19:48.487898+00', NULL),
	('fdce4217-7e6b-4887-9143-9bf4ccc86fdc', 'Chicken Arrabbiata', 'Spicy tomato pasta with chicken.', 340.00, 'PASTA', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500', false, '2026-08-12 18:19:48.487898+00', NULL),
	('30e8c74f-a99f-4fb2-b6aa-669d9a020700', 'Chicken Mac & Cheese', 'Cheesy pasta with chicken.', 330.00, 'PASTA', 'https://images.unsplash.com/photo-1555949258-eb67b2808201?w=500', false, '2026-08-12 18:19:48.487898+00', NULL),
	('2636b789-76ee-4f0b-a890-baf90a302f58', 'Chicken Pesto', 'Pesto pasta with grilled chicken.', 370.00, 'PASTA', 'https://images.unsplash.com/photo-1595295333158-4742f28fbd85?w=500', false, '2026-08-12 18:19:48.487898+00', NULL),
	('d7bac15b-028f-48ea-b78a-7ce02e821868', 'Chicken Aglio Olio', 'Olive oil garlic pasta with chicken.', 350.00, 'PASTA', 'https://images.unsplash.com/photo-1560781290-7dc94c0f8f4f?w=500', false, '2026-08-12 18:19:48.487898+00', NULL),
	('2cec2f3f-23f8-4c4b-93a3-042f0f57e58d', 'Cream of Vegetable Soup', 'Creamy mixed vegetable soup.', 160.00, 'SOUPS', 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500', false, '2026-08-12 18:19:48.487898+00', NULL),
	('acda473a-4cf6-4c82-898d-e62b92643c4f', 'Cream of Chicken Soup', 'Smooth creamy chicken soup.', 190.00, 'SOUPS', 'https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?w=500', false, '2026-08-12 18:19:48.487898+00', NULL),
	('1a4446e7-339b-4595-942b-bc070ed41b78', 'Cream of Broccoli Soup', 'Healthy broccoli cream soup.', 170.00, 'SOUPS', 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=500', false, '2026-08-12 18:19:48.487898+00', NULL),
	('b40ee49c-ea23-4469-82d3-5e3f006027a0', 'Roast Corn Garlic Soup', 'Sweet corn with garlic flavor.', 170.00, 'SOUPS', 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=500', false, '2026-08-12 18:19:48.487898+00', NULL),
	('fdbb2534-264b-459e-9a22-8304e8b23895', 'Cream of Spinach Soup', 'Creamy spinach delight.', 160.00, 'SOUPS', 'https://images.unsplash.com/photo-1613844237701-8f3664fc2eff?w=500', false, '2026-08-12 18:19:48.487898+00', NULL),
	('ee8e2cc3-f6c7-4346-ad75-154f3e32ae01', 'Broccoli Almond Soup', 'Broccoli soup with almonds.', 180.00, 'SOUPS', 'https://images.unsplash.com/photo-1547592180-85f173990554?w=500', false, '2026-08-12 18:19:48.487898+00', NULL),
	('aa95ad96-4668-4893-b588-8d26a541311b', 'Cream of Tomato Soup', 'Classic creamy tomato soup.', 150.00, 'SOUPS', 'https://images.unsplash.com/photo-1541529086526-db283c563270?w=500', false, '2026-08-12 18:19:48.487898+00', NULL),
	('6f3574ee-12ce-43fd-bad4-55b6d14cf7db', 'Veg Manchow Soup', 'Hot & spicy veg Manchow.', 170.00, 'SOUPS', 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=500', false, '2026-08-12 18:19:48.487898+00', NULL),
	('adb3399f-5295-418f-9d97-8d96fb8ae542', 'Chicken Manchow Soup', 'Spicy chicken Manchow soup.', 200.00, 'SOUPS', 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=500', false, '2026-08-12 18:19:48.487898+00', NULL),
	('e08c5b8c-a6c2-48f6-b4a7-2d0216689746', 'Veg Lemon Coriander Soup', 'Fresh lemon & coriander flavors.', 160.00, 'SOUPS', 'https://images.unsplash.com/photo-1511994298241-608e28f14fde?w=500', false, '2026-08-12 18:19:48.487898+00', NULL),
	('3b295cbf-a21b-475c-9cf0-0340782555a5', 'Chicken Lemon Coriander Soup', 'Chicken soup with lemon coriander.', 190.00, 'SOUPS', 'https://images.unsplash.com/photo-1588566565463-180a5b2090d2?w=500', false, '2026-08-12 18:19:48.487898+00', NULL);


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."orders" ("id", "token", "status", "total", "items", "table_id", "created_at", "placed_at_ist", "customer_phone", "customer_name", "gstin", "discount", "order_type", "notes", "custom_instructions", "aggregator_platform") VALUES
	('5be64b59-537d-4c69-97ad-86fe5126fc75', '#6901', 'completed', 1785.00, '[{"id": "item_1787075871018_1", "name": "Xtra Loaded Stack Burger", "price": 340, "quantity": 5}]', 'Walk-in POS', '2026-08-18 17:58:28.891+00', NULL, '+91 9922441812', 'Shravan', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('7740acb4-3edf-48eb-97de-b12b93a10ace', '5485', 'completed', 1160.00, '[{"id": "faade783-ec12-418c-9226-ff63441569e8", "name": "Xtra Loaded Stack Burger", "image": "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=500", "price": 340, "quantity": 2}, {"id": "52fe22fa-18d4-4662-9cf3-9ffa749bd844", "name": "Blue Sunset", "image": "https://images.unsplash.com/photo-1536935338788-846bb9981813?w=500", "price": 240, "quantity": 2}]', 'T-01', '2026-08-12 18:20:08.766683+00', '12 Aug 2026, 11:50:09 pm', '+91 9876543210', 'Aarav Sharma', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('c8e2b775-0548-4e92-9a26-68bd1dd9fbc4', 'SWI-9821', 'completed', 640.00, '[{"id": "item-1", "name": "Chicken Tandoori Tikka Pizza", "price": 460, "quantity": 1}, {"id": "item-2", "name": "Cold Coffee", "price": 180, "quantity": 1}]', 'SWIGGY Online', '2026-08-13 17:59:35.173+00', '2026-08-13 23:29:35', '+919876543210', 'Rohan Deshmukh', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('ab4a60a7-9792-4127-aafb-5adbb873a848', '8338', 'completed', 450.00, '[{"id": "item-1", "name": "Chef Special Pizza", "price": 450, "quantity": 1}]', 'VYOMA_TESTER_PING_HEALTH Online', '2026-08-17 12:29:09.591+00', '2026-08-17 17:59:09', '+919876543210', 'VYOMA_TESTER_PING_HEALTH Customer', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('c86030ee-9ec2-4b57-897e-e152786cb05e', '#7475', 'completed', 250.00, '[{"id": "item_1", "name": "Masala Dosa", "price": 250, "quantity": 1}]', 'Dyno API', '2026-08-19 07:03:21.349+00', NULL, '+919123456789', 'Rohan Gupta', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('8d511d18-bf08-41f2-85a9-3f7a65f1245f', '3988', 'completed', 1566.00, '[{"id": "dba1e8c0-890c-4803-af8f-d95b813188c6", "name": "Aglio Olio", "image": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500", "price": 290, "quantity": 2}, {"id": "faade783-ec12-418c-9226-ff63441569e8", "name": "Xtra Loaded Stack Burger", "image": "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=500", "price": 340, "quantity": 2}, {"id": "52fe22fa-18d4-4662-9cf3-9ffa749bd844", "name": "Blue Sunset", "image": "https://images.unsplash.com/photo-1536935338788-846bb9981813?w=500", "price": 240, "quantity": 2}]', 'T-01', '2026-08-13 04:52:09.584493+00', '13 Aug 2026, 10:22:09 am', '+91 9922441812', 'Shravan', '57AgACR5054K1b6', NULL, 'dine_in', NULL, NULL, NULL),
	('87c96b36-0f95-4ab0-9d17-bc0ce0759bf4', 'TK-101', 'completed', 730.00, '[{"name": "Chicken Tandoori Tikka Pizza", "price": 460.00, "quantity": 1}, {"name": "Mac & Cheese", "price": 270.00, "quantity": 1}]', 'T-04', '2026-08-13 10:08:23.852224+00', '07:15 PM', '+919822011223', 'Aarav Sharma', NULL, 50, 'dine_in', NULL, NULL, NULL),
	('e1e2bf09-ea4a-4b0c-920d-2751ddf0269e', 'TK-102', 'completed', 530.00, '[{"name": "Hazelnut Frosted Shake", "price": 240.00, "quantity": 1}, {"name": "Alfredo Pasta", "price": 290.00, "quantity": 1}]', 'T-12', '2026-08-13 10:08:23.852224+00', '07:45 PM', '+919890123456', 'Ananya Deshmukh', NULL, 0, 'dine_in', NULL, NULL, NULL),
	('a1e93bef-7ac0-4925-ab36-575cfa3f9b8b', 'TK-103', 'completed', 670.00, '[{"name": "Fish & Chips", "price": 350.00, "quantity": 1}, {"name": "Italian Margherita", "price": 320.00, "quantity": 1}]', 'T-02', '2026-08-13 10:08:23.852224+00', '08:10 PM', '+919765432109', 'Rohan Kulkarni', NULL, 0, 'dine_in', NULL, NULL, NULL),
	('66c98e55-39a5-4731-934a-648a5681939f', 'TK-104', 'completed', 1050.00, '[{"name": "Chicken Exotic Pizza", "price": 480.00, "quantity": 1}, {"name": "Chicken Pesto", "price": 370.00, "quantity": 1}, {"name": "Blue Sunset", "price": 240.00, "quantity": 1}]', 'T-07', '2026-08-13 10:08:23.852224+00', '08:30 PM', '+919123456789', 'Priya Iyer', NULL, 100, 'dine_in', NULL, NULL, NULL),
	('56ce2258-fa15-4e38-aa28-3225ac9fc5d9', 'TOK-9510', 'completed', 0.00, '[]', NULL, '2026-08-19 18:12:36.495659+00', '19/8/2026, 11:42:35 pm', NULL, NULL, NULL, 0, 'dine_in', NULL, NULL, 'ZOMATO'),
	('8670547c-bc05-4fde-9be8-43ca9fa1ca16', '8370', 'completed', 1188.00, '[{"id": "c7745ec2-4332-42e1-9688-d3abb6ee3b63", "name": "Grilled Chicken Burger", "price": 280, "quantity": 2}, {"id": "5aedef07-a58d-458c-8407-f96ec202907e", "name": "Tandoori Paneer Tikka Pizza", "price": 380, "quantity": 2}]', 'Table 01', '2026-08-13 18:48:17.651+00', '2026-08-14 00:18:17', '+91 9922441812', 'Shravan', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('e1aabe67-3e03-4a1e-b345-08c3ffe111be', 'TK-105', 'completed', 520.00, '[{"name": "Xtra Stack Burger", "price": 290.00, "quantity": 1}, {"name": "Watermelon Caipiroska", "price": 230.00, "quantity": 1}]', 'T-15', '2026-08-13 10:08:23.852224+00', '08:50 PM', '+919988776655', 'Aditya Verma', NULL, 0, 'dine_in', NULL, NULL, NULL),
	('277ed4c9-e242-44a3-9423-f3eba6a3ff51', '9556', 'completed', 1500.00, '[{"id": "ITM-Z01", "name": "Hyderabadi Mutton Dum Biryani (Large)", "price": 490, "quantity": 2}, {"id": "ITM-Z02", "name": "Galouti Kebab with Ulte Tawa Ka Paratha", "price": 380, "quantity": 1}, {"id": "ITM-Z03", "name": "Gulab Jamun with Rabri (2 pcs)", "price": 140, "quantity": 1}]', 'ZOMATO Online', '2026-08-17 12:34:46.348+00', '2026-08-17 18:04:46', '+91 98450 11223', 'Vikramaditya Roy', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('5f09b84a-b455-4b8d-88cc-c237b86ed8a5', 'TK-106', 'completed', 430.00, '[{"name": "Jalapeño Cheese Corn Balls", "price": 220.00, "quantity": 1}, {"name": "Mojito Crescendo", "price": 210.00, "quantity": 1}]', 'T-09', '2026-08-13 10:08:23.852224+00', '09:05 PM', '+919811223344', 'Sneha Patel', NULL, 0, 'dine_in', NULL, NULL, NULL),
	('e33b62ce-2673-4264-88ed-a290e1cffba2', 'TOK-3351', 'completed', 0.00, '[]', NULL, '2026-09-03 09:48:16.546757+00', '3/9/2026, 3:18:15 pm', NULL, NULL, NULL, 0, 'dine_in', NULL, NULL, 'ZOMATO'),
	('5944e9f5-972a-400b-a154-998fac016416', '9910', 'completed', 1296.00, '[{"id": "faade783-ec12-418c-9226-ff63441569e8", "name": "Xtra Loaded Stack Burger", "price": 340, "quantity": 2}, {"id": "5aedef07-a58d-458c-8407-f96ec202907e", "name": "Tandoori Paneer Tikka Pizza", "price": 380, "quantity": 2}]', 'Table 01', '2026-08-13 18:57:16.235+00', '2026-08-14 00:27:16', '+91 9922441812', 'Shravan', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('8bfd5344-0f71-4353-8f94-9f3b10238a04', '7019', 'completed', 0.00, '[{"id": "ITM-Z03", "name": "Xtra Loaded Stack Burger", "price": 0, "quantity": 1}]', 'ZOMATO Online', '2026-08-17 17:31:09.342+00', '2026-08-17 23:01:09', '+919876543210', 'ZOMATO Customer', NULL, NULL, 'aggregator', 'Pack extra salan & onion salad. Do not ring bell, infant sleeping.', NULL, 'zomato'),
	('4fe6035b-d4e7-43d2-87db-8ca4b2f2e638', '8834', 'completed', 1494.00, '[{"id": "faade783-ec12-418c-9226-ff63441569e8", "name": "Xtra Loaded Stack Burger", "price": 340, "quantity": 2}, {"id": "2fbe41fd-bfcf-45b8-a9d9-9e83b31cd20a", "name": "Chicken Gourmet Delight", "price": 490, "quantity": 2}]', 'Table 06', '2026-08-14 20:31:08.261+00', '2026-08-15 02:01:08', '+91 9922441812', 'Shravan', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('5445ad82-42c1-46de-b7b2-2414e0093699', '3195', 'completed', 920.00, '[{"id": "2392fa5d-8de3-428d-a31f-1d82bec91fd1", "name": "Xtra Stack Burger", "price": 290, "quantity": 2}, {"id": "faade783-ec12-418c-9226-ff63441569e8", "name": "Xtra Loaded Stack Burger", "price": 340, "quantity": 1}]', 'Table 02', '2026-08-15 17:28:12.431+00', '2026-08-15 22:58:12', '+91 9922441812', 'Shravan', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('d2ceab30-33bc-4399-8f09-547f20510568', '4401', 'completed', 1280.00, '[{"id": "item-1", "name": "Charcoal Grilled Paneer Tikka", "price": 460, "quantity": 1}, {"id": "item-2", "name": "Butter Garlic Naan", "price": 110, "quantity": 3}, {"id": "item-3", "name": "Dal Makhani Signature Pot", "price": 490, "quantity": 1}]', 'PETPOOJA Online', '2026-08-16 18:52:26.828+00', '2026-08-17 00:22:26', '+919876543210', 'PETPOOJA Customer', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('58f5640f-3e6e-43bc-9dac-6717aa38d3db', 'SWI-9821', 'completed', 640.00, '[{"id": "item-1", "name": "Chicken Tandoori Tikka Pizza", "price": 460, "quantity": 1}, {"id": "item-2", "name": "Cold Coffee", "price": 180, "quantity": 1}]', 'SWIGGY Online', '2026-08-13 18:09:43.251+00', '2026-08-13 23:39:43', '+919876543210', 'Rohan Deshmukh', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('c5114c3b-a31b-4226-b694-78e68f4587e1', '3563', 'completed', 340.00, '[{"id": "ITM-Z03", "name": "Xtra Loaded Stack Burger", "price": 340, "quantity": 1}]', 'ZOMATO Online', '2026-08-17 12:29:13.085+00', '2026-08-17 17:59:13', '+91 9922441812', 'Shravan', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('ae7155ef-547b-4766-8ab3-7bde21bde9ec', 'TK-108', 'completed', 430.00, '[{"name": "Lava Cake", "price": 280.00, "quantity": 1}, {"name": "Black Hot Americano", "price": 150.00, "quantity": 1}]', 'T-05', '2026-08-13 10:08:23.852224+00', '09:25 PM', '+919654321098', 'Tanvi Mehta', NULL, 0, 'dine_in', NULL, NULL, NULL),
	('ab2f1122-88ab-483c-9ef0-5f671362804a', 'TOK-4610', 'completed', 0.00, '[]', NULL, '2026-08-19 17:27:33.38134+00', '19/8/2026, 10:57:32 pm', NULL, NULL, NULL, 0, 'dine_in', NULL, NULL, NULL),
	('25e30de5-0f0e-4794-9583-f8b97ddb4230', 'ZOM-9821', 'completed', 640.00, '[{"id": "item-1", "name": "Chicken Tandoori Tikka Pizza", "price": 460, "quantity": 1}, {"id": "item-2", "name": "Cold Coffee", "price": 180, "quantity": 1}]', 'ZOMATO Online', '2026-08-13 18:15:29.433+00', '2026-08-13 23:45:29', '+919876543210', 'Rohan Deshmukh', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('917b7a30-610f-42ee-97c2-0151692955e7', '6759', 'completed', 846.00, '[{"id": "dba1e8c0-890c-4803-af8f-d95b813188c6", "name": "Aglio Olio", "image": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500", "price": 290, "quantity": 2}, {"id": "f628f564-94ac-454d-8710-7829f6f247e1", "name": "Cheese Cherry Pineapple Skewers", "image": "https://images.unsplash.com/photo-1599321955726-e048426594af?w=500", "price": 180, "quantity": 2}]', '3', '2026-08-13 10:11:01.671817+00', '13 Aug 2026, 3:41:00 pm', '+91 9730011223', 'Vikram Joshi', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('c77b7629-55b3-492f-b2b3-3671cb6c9958', '8116', 'completed', 1296.00, '[{"id": "faade783-ec12-418c-9226-ff63441569e8", "name": "Xtra Loaded Stack Burger", "price": 340, "quantity": 2}, {"id": "5aedef07-a58d-458c-8407-f96ec202907e", "name": "Tandoori Paneer Tikka Pizza", "price": 380, "quantity": 2}]', 'Table 01', '2026-08-13 18:50:31.624+00', '2026-08-14 00:20:31', '+91 9922441218', 'Shravan', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('f094bb5d-ce60-4620-a108-b7950d3cbea6', 'TK-107', 'completed', 1190.00, '[{"name": "Chicken Gourmet Delight", "price": 490.00, "quantity": 1}, {"name": "Chicken Alfredo", "price": 350.00, "quantity": 1}, {"name": "Skyline Spark (Red Bull)", "price": 280.00, "quantity": 1}, {"name": "Hot Chocolate", "price": 180.00, "quantity": 1}]', 'T-01', '2026-08-13 10:08:23.852224+00', '09:15 PM', '+919730011223', 'Vikram Joshi', NULL, 150, 'dine_in', NULL, NULL, NULL),
	('441c6274-58bc-48a2-9991-c02c1f40bf07', 'ZOM-9821', 'completed', 576.00, '[{"id": "item-1", "name": "Chicken Tandoori Tikka Pizza", "price": 460, "quantity": 1}, {"id": "item-2", "name": "Cold Coffee", "price": 180, "quantity": 1}]', 'ZOMATO Online', '2026-08-13 14:40:20.714+00', NULL, '+919876543210', 'Rohan Deshmukh', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('c70cf5eb-9cdc-4343-8364-8775974bc0c4', '3002', 'completed', 150.00, '[{"id": "5b0747f6-f5bf-4b48-99e2-f2257706abb7", "name": "Cheesecake", "image": "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500", "price": 150, "quantity": 1}]', '3', '2026-08-13 11:34:59.923623+00', '13 Aug 2026, 5:04:59 pm', '+91 7040202269', 'Anish', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('338562bc-9b4e-44c6-b867-df8ed2f4ae26', 'TOK-6199', 'completed', 0.00, '[]', NULL, '2026-08-19 17:27:58.299557+00', '19/8/2026, 10:57:57 pm', NULL, NULL, NULL, 0, 'dine_in', NULL, NULL, NULL),
	('d28b26e4-b07d-49e0-9dee-35dfa050b4b7', 'ZOM-6623', 'completed', 640.00, '[{"id": "item-1", "name": "Chicken Tandoori Tikka Pizza", "price": 460, "quantity": 1}, {"id": "item-2", "name": "Cold Coffee", "price": 180, "quantity": 1}]', 'ZOMATO Online', '2026-08-13 14:08:37.562+00', NULL, '+919876543210', 'Rohan Deshmukh', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('82eb50ea-f536-49d8-a205-f0644e95bd12', '9215', 'completed', 1296.00, '[{"id": "faade783-ec12-418c-9226-ff63441569e8", "name": "Xtra Loaded Stack Burger", "price": 340, "quantity": 2}, {"id": "5aedef07-a58d-458c-8407-f96ec202907e", "name": "Tandoori Paneer Tikka Pizza", "price": 380, "quantity": 2}]', 'Table 01', '2026-08-13 19:00:25.005+00', '2026-08-14 00:30:25', '+91 9922441812', 'Shravan', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('c7c5a0c2-fa6e-4e5c-92ef-c3c79ce6c405', 'ZOM-9821', 'completed', 100.00, '[{"id": "item-1", "name": "Pizza", "price": 100, "quantity": 1}]', 'ZOMATO Online', '2026-08-13 14:28:06.543+00', NULL, '+919876543210', 'Test User', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('57954161-5155-4849-bc06-5397ee61ea3a', '2720', 'completed', 920.00, '[{"id": "e637a102-dfb3-4d11-bbd0-0f926a75f2b7", "name": "Chicken Tandoori Tikka Pizza", "price": 460, "quantity": 2}]', 'Table 04', '2026-08-14 20:33:44.764+00', '2026-08-15 02:03:44', '+91 9922441812', 'Shravan', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('b6a00133-8062-4d79-8562-661b50c01efa', 'ZOM-9821', 'completed', 576.00, '[{"id": "item-1", "name": "Chicken Tandoori Tikka Pizza", "price": 460, "quantity": 1}, {"id": "item-2", "name": "Cold Coffee", "price": 180, "quantity": 1}]', 'ZOMATO Online', '2026-08-13 14:46:08.892+00', '2026-08-13 20:16:08', '+919876543210', 'Rohan Deshmukh', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('ec81d7c4-d680-44a6-96b0-f6ee663dc24e', 'ZOM-9821', 'completed', 640.00, '[{"id": "item-1", "name": "Chicken Tandoori Tikka Pizza", "price": 460, "quantity": 1}, {"id": "item-2", "name": "Cold Coffee", "price": 180, "quantity": 1}]', 'ZOMATO Online', '2026-08-13 16:17:49.881+00', '2026-08-13 21:47:49', '+919876543210', 'Rohan Deshmukh', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('3d310dcb-2961-4c6d-9ac6-84c5c4f0ff14', 'DIN-Te13-6578', 'completed', 1020.00, '[{"id": "faade783-ec12-418c-9226-ff63441569e8", "name": "Xtra Loaded Stack Burger", "price": 340, "quantity": 3}]', 'Table 13', '2026-08-13 16:20:49.719+00', '2026-08-13 21:50:49', '+91 9922441812', 'Shravan', NULL, NULL, 'dine_in', 'Less Spicy', 'Less Spicy', NULL),
	('d96b0fbc-8dfb-43e7-9bf6-388366d1b226', 'DIN-Te01-1366', 'completed', 680.00, '[{"id": "faade783-ec12-418c-9226-ff63441569e8", "name": "Xtra Loaded Stack Burger", "price": 340, "quantity": 2}]', 'Table 01', '2026-08-13 16:59:17.004+00', '2026-08-13 22:29:17', NULL, 'Guest', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('64c5b04a-6e4a-4273-8ff9-201aa00b29ef', 'DIN-Te01-1333', 'completed', 680.00, '[{"id": "faade783-ec12-418c-9226-ff63441569e8", "name": "Xtra Loaded Stack Burger", "price": 340, "quantity": 2}]', 'Table 01', '2026-08-13 16:59:42.375+00', '2026-08-13 22:29:42', NULL, 'Guest', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('6bcc33b3-a8a5-4f1d-9598-e609a7e4bea6', 'ZOM-9821', 'completed', 640.00, '[{"id": "item-1", "name": "Chicken Tandoori Tikka Pizza", "price": 460, "quantity": 1}, {"id": "item-2", "name": "Cold Coffee", "price": 180, "quantity": 1}]', 'ZOMATO Online', '2026-08-13 17:26:45.369+00', '2026-08-13 22:56:45', '+919876543210', 'Rohan Deshmukh', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('57e22c97-7f5e-4670-b3f9-5c9adc910d62', '8639', 'completed', 600.00, '[{"id": "1cb88570-dbfe-41b2-969c-dabf31c14b1a", "name": "Fish Fingers", "price": 300, "quantity": 2}]', 'Table 02', '2026-08-13 17:44:17.283+00', '2026-08-13 23:14:17', '+91 9922441812', 'Shravan', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('e55b7ae7-f18b-42cd-a4d5-3be0a8c3fc9a', 'ZOM-9821', 'completed', 640.00, '[{"id": "item-1", "name": "Chicken Tandoori Tikka Pizza", "price": 460, "quantity": 1}, {"id": "item-2", "name": "Cold Coffee", "price": 180, "quantity": 1}]', 'ZOMATO Online', '2026-08-13 17:58:01.755+00', '2026-08-13 23:28:01', '+919876543210', 'Rohan Deshmukh', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('705586d3-3304-4027-82de-809971b49dc3', '#5629', 'completed', 420.00, '[{"id": "101", "name": "Dal Makhani", "price": 260, "quantity": 1}, {"id": "102", "name": "Butter Naan", "price": 80, "quantity": 2}]', 'Dyno API', '2026-08-19 06:35:35.63+00', NULL, 'Masked Number', 'Vikram Sethi', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('7ffa0386-2c47-40ec-915d-bcb3c77fc719', '7837', 'completed', 340.00, '[{"id": "ITM-Z03", "name": "Xtra Loaded Stack Burger", "price": 340, "quantity": 1}]', 'ZOMATO Online', '2026-08-17 12:33:03.896+00', '2026-08-17 18:03:03', '+91 99224 41812', 'Shravan', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('f74cde46-3ef1-4582-9003-543eef7d4730', '8460', 'completed', 450.00, '[{"id": "item-1", "name": "Chef Special Pizza", "price": 450, "quantity": 1}]', 'VYOMA_TESTER_PING_HEALTH Online', '2026-08-17 11:20:44.047+00', '2026-08-17 16:50:44', '+919876543210', 'VYOMA_TESTER_PING_HEALTH Customer', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('18fb6269-5eae-4135-9057-a8dc2211ae3f', '5827', 'completed', 340.00, '[{"id": "ITM-Z03", "name": "Xtra Loaded Stack Burger", "price": 340, "quantity": 1}]', 'ZOMATO Online', '2026-08-17 12:56:16.074+00', '2026-08-17 18:26:16', '+91 99224 41812', 'Shravan', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('0a4c7e2c-69c7-464c-84f6-3ac136beef7e', '#2976', 'completed', 0.00, '[]', 'VYOMA_TESTER_PING_HEALTH Order', '2026-08-19 17:56:42.679+00', '19/8/2026, 11:26:42 pm', 'Masked Number', 'Guest Customer', NULL, NULL, 'delivery', '[VYOMA_TESTER_PING_HEALTH] Order ID: DYN_1787162202976', NULL, 'vyoma_tester_ping_health'),
	('71378dc5-0f57-4ced-8c87-8c2d7e742012', '#5639', 'completed', 0.00, '[]', 'Dyno API', '2026-08-19 07:03:25.639+00', NULL, 'Masked Number', 'Guest Customer', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('a920d283-f461-43f4-81fb-a7f0075eb3f4', '9821', 'completed', 0.00, '[{"id": "ITM-0833", "name": "Xtra Loaded Stack Burger", "price": 0, "quantity": 1}]', 'ZOMATO Online', '2026-08-17 17:40:57.863+00', '2026-08-17 23:10:57', '+919876543210', 'ZOMATO Customer', NULL, NULL, 'aggregator', 'Pack extra salan & onion salad. Do not ring bell, infant sleeping.', NULL, 'zomato'),
	('f1289d3d-e705-4678-8720-8a2f846c70f5', '7860', 'completed', 246.50, '[{"id": "dba1e8c0-890c-4803-af8f-d95b813188c6", "name": "Aglio Olio", "image": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500", "price": 290, "quantity": 1}]', '3', '2026-08-21 10:33:37.264841+00', '21 Aug 2026, 4:03:36 pm', '+91 7040202269', 'Anish', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('c0627723-8884-4932-b168-b33b1fe84cfa', '9821', 'completed', 0.00, '[{"id": "ITM-Z03", "name": "Xtra Loaded Stack Burger", "price": 0, "quantity": 1}]', 'ZOMATO Online', '2026-08-17 17:56:57.953+00', '2026-08-17 23:26:57', '+919876543210', 'ZOMATO Customer', NULL, NULL, 'aggregator', 'Pack extra salan & onion salad. Do not ring bell, infant sleeping.', NULL, 'zomato'),
	('b1747e34-fd73-4bf1-a3de-97680199f44c', 'TOK-1479', 'completed', 0.00, '[]', NULL, '2026-10-06 15:14:58.438658+00', '6/10/2026, 8:44:57 pm', NULL, NULL, NULL, 0, 'dine_in', NULL, NULL, 'ZOMATO'),
	('3b5dfba7-1ca2-43d7-a657-69d4d0a2fe42', 'TOK-9682', 'completed', 0.00, '[]', NULL, '2026-08-19 17:27:35.871638+00', '19/8/2026, 10:57:35 pm', NULL, NULL, NULL, 0, 'dine_in', NULL, NULL, NULL),
	('e4408ef0-8d07-4e3c-aeea-62e7ce5c2fa8', '9821', 'completed', 0.00, '[{"id": "ITM-Z03", "name": "Xtra Loaded Stack Burger", "price": 0, "quantity": 1}]', 'ZOMATO Online', '2026-08-17 18:56:18.093+00', '2026-08-18 00:26:18', '+919876543210', 'ZOMATO Customer', NULL, NULL, 'aggregator', 'Pack extra salan & onion salad. Do not ring bell, infant sleeping.', NULL, 'zomato'),
	('098291cd-cb21-442d-8088-ae95bcc10350', '9821', 'completed', 0.00, '[{"id": "ITM-Z03", "name": "Xtra Loaded Stack Burger", "price": 0, "quantity": 1}]', 'ZOMATO Online', '2026-08-17 18:10:49.836+00', '2026-08-17 23:40:49', '+919876543210', 'ZOMATO Customer', NULL, NULL, 'aggregator', 'Pack extra salan & onion salad. Do not ring bell, infant sleeping.', NULL, 'zomato'),
	('bade5dfc-99f3-4dcd-bf58-367a6bee240b', '9821', 'completed', 0.00, '[{"id": "ITM-Z01", "name": "Xtra Loaded Stack Burger", "price": 0, "quantity": 2}]', 'ZOMATO Online', '2026-08-17 18:13:48.298+00', '2026-08-17 23:43:48', '+919876543210', 'ZOMATO Customer', NULL, NULL, 'aggregator', 'Pack extra salan & onion salad. Do not ring bell, infant sleeping.', NULL, 'zomato'),
	('fcebeea2-2e31-4a13-8b66-6510730fba84', 'TOK-2829', 'completed', 0.00, '[]', NULL, '2026-08-19 17:30:15.531501+00', '19/8/2026, 11:00:14 pm', NULL, NULL, NULL, 0, 'dine_in', NULL, NULL, 'ZOMATO'),
	('9b999d63-749d-400a-8b22-7c330678e0d2', '9821', 'completed', 0.00, '[{"id": "ITM-Z03", "name": "Xtra Loaded Stack Burger", "price": 0, "quantity": 1}]', 'ZOMATO Online', '2026-08-17 18:44:11.803+00', '2026-08-18 00:14:11', '+919876543210', 'ZOMATO Customer', NULL, NULL, 'aggregator', 'Pack extra salan & onion salad. Do not ring bell, infant sleeping.', NULL, 'zomato'),
	('789d0f7a-4107-4384-8512-01b8d27cbb33', '6417', 'completed', 340.00, '[{"id": "ITM-1335", "name": "Xtra Loaded Stack Burger", "price": 340, "quantity": 1}]', 'ZOMATO Online', '2026-08-17 11:22:58.291+00', '2026-08-17 16:52:58', '+91 9922441812', 'Shravan', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('6533afdc-8188-473e-94b9-456dc098f0d6', '9821', 'completed', 0.00, '[{"id": "ITM-Z03", "name": "Xtra Loaded Stack Burger", "price": 0, "quantity": 1}]', 'ZOMATO Online', '2026-08-17 19:19:24.349+00', '2026-08-18 00:49:24', '+919876543210', 'ZOMATO Customer', NULL, NULL, 'aggregator', 'Pack extra salan & onion salad. Do not ring bell, infant sleeping.', NULL, 'zomato'),
	('cc1a0e73-fed3-4888-9a6a-f82b9c5cd89b', '9821', 'completed', 0.00, '[{"id": "ITM-Z03", "name": "Xtra Loaded Stack Burger", "price": 0, "quantity": 1}]', 'ZOMATO Online', '2026-08-18 10:33:34.806+00', '2026-08-18 16:03:34', '+919876543210', 'ZOMATO Customer', NULL, NULL, 'aggregator', 'Pack extra salan & onion salad. Do not ring bell, infant sleeping.', NULL, 'zomato'),
	('9b448702-f28a-43ea-8617-6ca1ad4e4d8c', '9237', 'completed', 450.00, '[{"id": "item-1", "name": "Chef Special Pizza", "price": 450, "quantity": 1}]', 'VYOMA_TESTER_PING_HEALTH Online', '2026-08-17 11:24:26.157+00', '2026-08-17 16:54:26', '+919876543210', 'VYOMA_TESTER_PING_HEALTH Customer', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('c9701521-c8ec-48fc-abda-b35a6738b59b', '9821', 'completed', 0.00, '[{"id": "ITM-Z03", "name": "Xtra Loaded Stack Burger", "price": 0, "quantity": 1}]', 'ZOMATO Online', '2026-08-18 13:25:48.63+00', '2026-08-18 18:55:48', '+919876543210', 'ZOMATO Customer', NULL, NULL, 'aggregator', 'Pack extra salan & onion salad. Do not ring bell, infant sleeping.', NULL, 'zomato'),
	('4459165e-2cf2-4dc7-9e40-a978fd0debac', '7353', 'completed', 450.00, '[{"id": "item-1", "name": "Chef Special Pizza", "price": 450, "quantity": 1}]', 'VYOMA_TESTER_PING_HEALTH Online', '2026-08-17 11:24:45.799+00', '2026-08-17 16:54:45', '+919876543210', 'VYOMA_TESTER_PING_HEALTH Customer', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('4382ffe9-2d1f-485c-92bf-4372c5f95f76', '#4091', 'completed', 450.00, '[{"id": "item-1", "name": "VYOMA_TESTER Combo Meal", "price": 450, "quantity": 1}]', 'VYOMA_TESTER Online', '2026-08-18 14:52:24.584+00', '2026-08-18 20:22:24', 'Masked (Platform Policy)', 'VYOMA_TESTER Customer', NULL, NULL, 'aggregator', 'Ref: PP_664091', NULL, 'other_online'),
	('0eb966f1-dcc6-48aa-bf43-a2dd950cde17', '8779', 'completed', 140.00, '[{"id": "ITM-Z03", "name": "Gulab Jamun with Rabri (2 pcs)", "price": 140, "quantity": 1}]', 'ZOMATO Online', '2026-08-17 11:33:09.369+00', '2026-08-17 17:03:09', '+91 98450 11223', 'Vikramaditya Roy', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('9b64286c-d9e3-4ac4-907b-030d840d6e51', '#5256', 'completed', 450.00, '[{"id": "item-1", "name": "VYOMA_TESTER Combo Meal", "price": 450, "quantity": 1}]', 'VYOMA_TESTER Online', '2026-08-18 15:06:50.74+00', '2026-08-18 20:36:50', 'Masked (Platform Policy)', 'VYOMA_TESTER Customer', NULL, NULL, 'aggregator', 'Ref: PP_735256', NULL, 'other_online'),
	('29e16197-2d9e-4bfa-b90a-e8a8fea79648', 'SWI-9821', 'completed', 640.00, '[{"id": "item-1", "name": "Chicken Tandoori Tikka Pizza", "price": 460, "quantity": 1}, {"id": "item-2", "name": "Cold Coffee", "price": 180, "quantity": 1}]', 'SWIGGY Online', '2026-08-13 18:15:15.842+00', '2026-08-13 23:45:15', '+919876543210', 'Rohan Deshmukh', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('059fa9c7-9f05-4178-aaa0-50ae55a2eafa', '5693', 'completed', 246.50, '[{"id": "dba1e8c0-890c-4803-af8f-d95b813188c6", "name": "Aglio Olio", "image": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500", "price": 290, "quantity": 1}]', '3', '2026-08-21 16:19:45.987519+00', '21 Aug 2026, 9:49:43 pm', '+91 7040202269', 'Anish', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('6736b5f6-8714-4d7e-a01b-3f372bb44bc8', '#3763', 'completed', 0.00, '[{"id": "ITM-Z03", "isVeg": true, "price": 340, "addons": [], "category": "Burgers", "itemName": "Xtra Loaded Stack Burger", "quantity": 1, "itemTotal": 340, "specialNotes": ""}]', 'Dyno API', '2026-08-19 08:14:32.881+00', '19/8/2026, 1:44:32 pm', 'Masked Number', 'Guest Customer', NULL, NULL, 'delivery', 'Ref ID: VY-ZOM-260819-3763', NULL, 'dyno'),
	('e5c54f5b-7584-4c30-a479-4b7c4ebeb7c4', '7073', 'completed', 1360.00, '[{"id": "faade783-ec12-418c-9226-ff63441569e8", "name": "Xtra Loaded Stack Burger", "price": 340, "quantity": 4}]', 'Table 01', '2026-09-03 09:53:25.502+00', '2026-09-03 15:23:25', '+91 9922441812', 'Shravan', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('b583473b-b68f-4407-9664-9de8187042a4', '#8651', 'completed', 462.00, '[{"id": "ITM-Z03", "isVeg": true, "price": 340, "addons": [], "category": "Burgers", "itemName": "Xtra Loaded Stack Burger", "quantity": 1, "itemTotal": 340, "specialNotes": ""}]', 'VYOMA_BLR_01', '2026-08-19 08:20:09.856+00', '19/8/2026, 1:50:09 pm', '+91 99224 41812', 'Shravan', NULL, NULL, 'delivery', '[ZOMATO] Order ID: VY-ZOM-260819-8651', 'Pack extra salan & onion salad. Do not ring bell, infant sleeping.', 'zomato'),
	('c6681aa8-9c92-4bd5-afee-85408fce65e1', 'KOT-8891', 'completed', 525.00, '[{"id": "970a0f14-2d1e-42b6-b88a-473ad2c51689", "name": "Crunchy Royale Burger", "notes": "", "price": 250.0, "total": 500.0, "item_id": "c9c0651f-b2c8-4fcf-a792-3806cfbc575d", "quantity": 2, "kot_round": 1}]', 'Table 01', '2026-08-23 10:49:46.891+00', '23-Aug-2026 04:19 PM', '+91 9922441812', 'Shravan', NULL, 0, 'dine_in', 'KOT Round #1', NULL, NULL),
	('c8a56f3d-5260-4ade-acda-05d90feb3a66', '#1906', 'completed', 880.00, '[{"id": "item_1", "name": "Chicken Biryani", "price": 380, "quantity": 2}, {"id": "item_2", "name": "Mango Lassi", "price": 120, "quantity": 1}]', 'Dyno API', '2026-08-19 18:24:07.125+00', NULL, 'Masked Number', 'Kavita Sharma', NULL, NULL, 'dine_in', 'Vendor: dyno | Ref: TEST_ITEMS_04', NULL, NULL),
	('e9b952cf-c8d8-4a80-bacb-95395705b04a', 'KOT-2195', 'completed', 556.50, '[{"id": "81884fa8-a590-49fc-bbd0-3f876727ea6a", "name": "Crunchy Royale Burger", "notes": "", "price": 250.0, "total": 250.0, "item_id": "c9c0651f-b2c8-4fcf-a792-3806cfbc575d", "quantity": 1, "kot_round": 1}, {"id": "4cdb2c30-2e9d-449a-8a93-4d976f212b85", "name": "Grilled Chicken Burger", "notes": "", "price": 280.0, "total": 280.0, "item_id": "c7745ec2-4332-42e1-9688-d3abb6ee3b63", "quantity": 1, "kot_round": 1}]', 'Table 01', '2026-08-25 15:28:22.195+00', '25-Aug-2026 08:58 PM', NULL, 'Guest', NULL, 0, 'dine_in', 'KOT Round #1', NULL, NULL),
	('aafe6962-054e-4fee-9580-bee9222302dd', '2051', 'completed', 340.00, '[{"id": "faade783-ec12-418c-9226-ff63441569e8", "name": "Xtra Loaded Stack Burger", "price": 340, "quantity": 1}]', 'Table 01', '2026-09-06 10:09:33.617+00', '2026-09-06 15:39:33', NULL, 'Guest', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('e28742e9-c4a5-4b57-9f1c-07a072057828', '1649', 'completed', 261.00, '[{"id": "dba1e8c0-890c-4803-af8f-d95b813188c6", "name": "Aglio Olio", "image": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500", "price": 290, "quantity": 1}]', '3', '2026-08-19 17:14:57.763479+00', '19 Aug 2026, 10:44:56 pm', '+91 7040202269', 'Anish', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('ad05d63e-3d87-44a8-9b5e-52b9b44be4c0', '5311', 'completed', 340.00, '[{"id": "faade783-ec12-418c-9226-ff63441569e8", "name": "Xtra Loaded Stack Burger", "price": 340, "quantity": 1}]', 'Table 01', '2026-09-06 10:10:22.773+00', '2026-09-06 15:40:22', '91+ 87883 76667', 'Shravan b', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('09596892-6907-419f-8a01-723e7468b8d0', '#9821', 'completed', 462.00, '[{"id": "ITM-Z03", "name": "Xtra Loaded Stack Burger", "price": 340, "quantity": 1}]', 'ZOMATO Online', '2026-08-18 16:17:46.6+00', NULL, '+91 98450 11223', 'Vikramaditya Roy', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('e65d1191-6c7e-45cf-8861-f8be3d712791', '#9821', 'completed', 1667.00, '[{"id": "ITM-Z01", "name": "Hyderabadi Mutton Dum Biryani (Large)", "price": 490, "quantity": 2}, {"id": "ITM-Z02", "name": "Galouti Kebab with Ulte Tawa Ka Paratha", "price": 380, "quantity": 1}, {"id": "ITM-Z03", "name": "Gulab Jamun with Rabri (2 pcs)", "price": 140, "quantity": 1}]', 'ZOMATO Online', '2026-08-18 16:22:36.707+00', NULL, '+91 98450 11223', 'Vikramaditya Roy', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('45e140d8-1ee5-487c-b0c9-438318304747', '#1002', 'completed', 350.00, '[{"id": "item_1", "name": "Chicken Tikka", "price": 350, "quantity": 1}]', 'PETPOOJA Online', '2026-08-19 11:33:27.185+00', NULL, 'Masked Number', 'Test Customer', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('72fdbddd-bd0f-462d-9a87-fc136c2843af', '9146', 'completed', 261.00, '[{"id": "dba1e8c0-890c-4803-af8f-d95b813188c6", "name": "Aglio Olio", "image": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500", "price": 290, "quantity": 1}]', '3', '2026-08-19 17:19:41.895229+00', '19 Aug 2026, 10:49:40 pm', '+91 7040202269', 'Anish', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('21aa8ee7-d223-4d27-bff0-a7e40c5b0f89', '5072', 'completed', 261.00, '[{"id": "dba1e8c0-890c-4803-af8f-d95b813188c6", "name": "Aglio Olio", "image": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500", "price": 290, "quantity": 1}]', '3', '2026-08-19 17:20:06.121765+00', '19 Aug 2026, 10:50:04 pm', '+91 7040202269', 'Anish', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('5635f379-3031-4dfc-afc2-b39f3fa40e5d', '3673', 'completed', 261.00, '[{"id": "dba1e8c0-890c-4803-af8f-d95b813188c6", "name": "Aglio Olio", "image": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500", "price": 290, "quantity": 1}]', '3', '2026-08-19 17:20:45.337205+00', '19 Aug 2026, 10:50:44 pm', '+91 7040202269', 'Anish', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('04b3fcaa-77a0-4db9-9dc0-0f9f1647bc9a', '4900', 'completed', 261.00, '[{"id": "dba1e8c0-890c-4803-af8f-d95b813188c6", "name": "Aglio Olio", "image": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500", "price": 290, "quantity": 1}]', 'T-01', '2026-08-19 17:25:05.117255+00', '19 Aug 2026, 10:55:04 pm', '+91 9876543210', 'Aarav Sharma', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('09fcbbdd-771a-4d36-8770-8e9ef5352f39', 'VY-ZOM-260819-5404', 'completed', 462.00, '[{"id": "ITM-Z03", "isVeg": true, "price": 340, "addons": [], "category": "Burgers", "itemName": "Xtra Loaded Stack Burger", "quantity": 1, "itemTotal": 340, "specialNotes": ""}]', 'Opposite Community Clubhouse', '2026-08-19 17:30:17.792984+00', '19/8/2026, 11:00:16 pm', '+91 98450 11223', 'Vikramaditya Roy', NULL, 0, 'delivery', 'Address: Villa 14, Palm Meadows, Whitefield, Bengaluru (560066) | Payment: PREPAID', 'Pack extra salan & onion salad. Do not ring bell, infant sleeping.', 'ZOMATO'),
	('78e353d5-f878-41bb-9a42-081eec95dd33', 'VY-ZOM-260819-5735', 'completed', 462.00, '[{"id": "ITM-Z03", "isVeg": true, "price": 340, "addons": [], "category": "Burgers", "itemName": "Xtra Loaded Stack Burger", "quantity": 1, "itemTotal": 340, "specialNotes": ""}]', 'Opposite Community Clubhouse', '2026-08-19 17:54:03.695712+00', '19/8/2026, 11:24:02 pm', '+91 98450 11223', 'Vikramaditya Roy', NULL, 0, 'delivery', 'Address: Villa 14, Palm Meadows, Whitefield, Bengaluru (560066) | Payment: PREPAID', 'Pack extra salan & onion salad. Do not ring bell, infant sleeping.', 'ZOMATO'),
	('619a5850-40d7-47e9-9118-b50ee75f49dc', 'KOT-2907', 'completed', 231.00, '[{"id": "a5425901-13c1-4ec4-a544-f0d4a3a20374", "name": "Veg Herb Delight Burger", "notes": "", "price": 220.0, "total": 220.0, "item_id": "6a005377-56f0-4926-8cb9-4a475045f20d", "quantity": 1, "kot_round": 1}]', 'AC-1', '2026-08-22 13:55:49.907+00', '22-Aug-2026 07:25 PM', NULL, NULL, NULL, 0, 'dine_in', 'KOT Round #1', NULL, NULL),
	('c27eef78-7a49-4160-9378-053f5313a5bd', 'TOK-8243', 'completed', 0.00, '[]', NULL, '2026-08-19 18:15:12.617671+00', '19/8/2026, 11:45:11 pm', NULL, NULL, NULL, 0, 'dine_in', NULL, NULL, 'ZOMATO'),
	('72ff14b0-67e9-4545-b12b-11237d290733', 'KOT-8652', 'completed', 556.50, '[{"id": "97a378a6-e20a-458e-bc3e-4ae346754854", "name": "Grilled Chicken Burger", "notes": "", "price": 280.0, "total": 280.0, "item_id": "c7745ec2-4332-42e1-9688-d3abb6ee3b63", "quantity": 1, "kot_round": 1}, {"id": "9a8bd943-0a2a-454b-9ac6-e982ce5ad127", "name": "Crunchy Royale Burger", "notes": "", "price": 250.0, "total": 250.0, "item_id": "c9c0651f-b2c8-4fcf-a792-3806cfbc575d", "quantity": 1, "kot_round": 1}]', 'Table 02', '2026-08-25 15:24:25.652+00', '25-Aug-2026 08:54 PM', NULL, 'Guest', NULL, 0, 'dine_in', 'KOT Round #1', NULL, NULL),
	('15c8d4b6-61b9-4281-a92f-5d032a8187d7', 'VY-ZOM-260819-8966', 'completed', 1667.00, '[{"id": "ITM-Z01", "isVeg": false, "price": 490, "addons": [{"id": "AD-01", "name": "Extra Mirchi Ka Salan", "price": 35}, {"id": "AD-02", "name": "Boiled Egg (2 pcs)", "price": 30}], "category": "Biryani", "itemName": "Hyderabadi Mutton Dum Biryani (Large)", "quantity": 2, "itemTotal": 1110, "specialNotes": "Extra spicy masala layer"}, {"id": "ITM-Z02", "isVeg": false, "price": 380, "addons": [], "category": "Starters", "itemName": "Galouti Kebab with Ulte Tawa Ka Paratha", "quantity": 1, "itemTotal": 380, "specialNotes": ""}, {"id": "ITM-Z03", "isVeg": true, "price": 140, "addons": [], "category": "Desserts", "itemName": "Gulab Jamun with Rabri (2 pcs)", "quantity": 1, "itemTotal": 140, "specialNotes": ""}]', 'Opposite Community Clubhouse', '2026-08-19 18:17:08.10485+00', '19/8/2026, 11:47:06 pm', '+91 98450 11223', 'Vikramaditya Roy', NULL, 150, 'delivery', 'Address: Villa 14, Palm Meadows, Whitefield, Bengaluru (560066) | Payment: PREPAID', 'Pack extra salan & onion salad. Do not ring bell, infant sleeping.', 'ZOMATO'),
	('14296957-eb5f-4436-b343-7278a946cf02', '5919', 'completed', 340.00, '[{"id": "faade783-ec12-418c-9226-ff63441569e8", "name": "Xtra Loaded Stack Burger", "price": 340, "quantity": 1}]', 'Table 01', '2026-09-04 12:42:38.288+00', '2026-09-04 18:12:38', '+91 9922441812', 'Shravan', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('bf749147-383b-401d-adae-79dc3d549607', '3910', 'completed', 680.00, '[{"id": "faade783-ec12-418c-9226-ff63441569e8", "name": "Xtra Loaded Stack Burger", "price": 340, "quantity": 2}]', 'Table 01', '2026-10-06 16:56:04.799+00', '2026-10-06 22:26:04', '+918788376667', 'Shravan b', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('c96b0441-2ea2-466b-8e2b-075cc800ccad', 'BATCH-MAG-260822-5846', 'completed', 550.00, '[{"id": "ITM-M01", "isVeg": false, "price": 260, "addons": [{"id": "AD-M1", "name": "Extra Cheddar Cheese Slice", "price": 30}, {"id": "AD-M2", "name": "Spicy Peri Peri Dip", "price": 25}], "category": "Burgers", "itemName": "Crispy Double Patty Chicken Burger", "quantity": 2, "itemTotal": 630, "specialNotes": ""}, {"id": "ITM-M02", "isVeg": true, "price": 180, "addons": [], "category": "Sides", "itemName": "Loaded Cheesy Fries (Jumbo)", "quantity": 1, "itemTotal": 180, "specialNotes": ""}, {"id": "ITM-M03", "isVeg": true, "price": 130, "addons": [], "category": "Beverages", "itemName": "Cold Coffee with Choco Ice Cream", "quantity": 2, "itemTotal": 260, "specialNotes": ""}]', 'Next to Sony Signal Cafe', '2026-08-22 19:56:14.370292+00', '23/8/2026, 1:26:14 am', '+91 99887 66554', 'Karan Mehra', NULL, 120, 'delivery', 'Address: Room 204, Stanza Living PG, Koramangala 4th Block, Bengaluru (560034) | Payment: COD', 'Batch Stress Test #8', 'MAGICPIN'),
	('de536c3b-3528-41b5-9fe7-e02134d8e6ce', 'BATCH-SWI-260822-3405', 'completed', 550.00, '[{"id": "ITM-S01", "isVeg": true, "price": 320, "addons": [{"id": "AD-S1", "name": "Extra Cashew Gravy", "price": 45}], "category": "Main Course Veg", "itemName": "Paneer Butter Masala (Handi Special)", "quantity": 1, "itemTotal": 365, "specialNotes": ""}, {"id": "ITM-S02", "isVeg": true, "price": 290, "addons": [], "category": "Main Course Veg", "itemName": "Dal Makhani Slow Cooked 24hrs", "quantity": 1, "itemTotal": 290, "specialNotes": ""}, {"id": "ITM-S03", "isVeg": true, "price": 65, "addons": [], "category": "Breads", "itemName": "Butter Garlic Naan", "quantity": 4, "itemTotal": 260, "specialNotes": ""}, {"id": "ITM-S04", "isVeg": true, "price": 180, "addons": [], "category": "Rice", "itemName": "Jeera Rice with Crispy Fried Onions", "quantity": 1, "itemTotal": 180, "specialNotes": ""}]', 'Tower B, 7th Floor', '2026-08-22 19:56:10.206346+00', '23/8/2026, 1:26:10 am', '+91 97654 88990', 'Pooja Deshmukh', NULL, 80, 'delivery', 'Address: B-703, Mantri Espana, Bellandur Outer Ring Road, Bengaluru (560103) | Payment: ONLINE', 'Batch Stress Test #7', 'SWIGGY'),
	('3115c463-0455-457b-9f78-3432aa03a283', '7980', 'completed', 1020.00, '[{"id": "faade783-ec12-418c-9226-ff63441569e8", "name": "Xtra Loaded Stack Burger", "price": 340, "quantity": 3}]', 'Table 01', '2026-09-16 00:39:40.202+00', '2026-09-16 06:09:40', '+91 87883 76667', 'Shravan', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('1f55ce1e-42c5-449e-838c-aa22d0c1d078', '4626', 'completed', 246.50, '[{"id": "dba1e8c0-890c-4803-af8f-d95b813188c6", "name": "Aglio Olio", "image": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500", "price": 290, "quantity": 1}]', '3', '2026-08-25 09:30:26.653703+00', '25 Aug 2026, 3:00:25 pm', '+91 7040202269', 'Anish', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('f3293f0b-1e82-43fe-ad5b-a72b501923a5', '#9821', 'completed', 462.00, '[{"id": "ITM-Z03", "name": "Xtra Loaded Stack Burger", "price": 340, "quantity": 1}]', 'ZOMATO Online', '2026-08-18 16:28:44.705+00', NULL, '+91 99224 41812', 'Shravan', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('da61e573-425b-4650-ae7d-0e3bb4d29be2', '#9821', 'completed', 462.00, '[{"id": "ITM-Z03", "qty": 1, "name": "Xtra Loaded Stack Burger", "isVeg": true, "notes": "", "price": 340, "addons": [], "category": "Burgers", "itemName": "Xtra Loaded Stack Burger", "quantity": 1, "item_name": "Xtra Loaded Stack Burger", "specialNotes": ""}]', 'VYOMA_BLR_01', '2026-08-19 08:25:02.247+00', '19/8/2026, 1:55:02 pm', '+91 99224 41812', 'Shravan', NULL, NULL, 'delivery', '[ZOMATO] Order ID: VY-ZOM-9821', 'Pack extra salan & onion salad. Do not ring bell, infant sleeping.', 'zomato'),
	('2f846837-bec3-40b1-9371-e6adb817af94', '#9821', 'completed', 462.00, '[{"id": "ITM-Z03", "qty": 1, "name": "Xtra Loaded Stack Burger", "isVeg": true, "notes": "", "price": 340, "addons": [], "category": "Burgers", "itemName": "Xtra Loaded Stack Burger", "quantity": 1, "item_name": "Xtra Loaded Stack Burger", "specialNotes": ""}]', 'VYOMA_BLR_01', '2026-08-19 18:05:11.575+00', '19/8/2026, 11:35:11 pm', '+91 98450 11223', 'Vikramaditya Roy', NULL, NULL, 'delivery', '[ZOMATO] Order ID: VY-ZOM-9821', 'Pack extra salan & onion salad. Do not ring bell, infant sleeping.', 'zomato'),
	('fa0e0c69-f3e6-4349-b826-0dfcbd27c07a', '9793', 'completed', 630.00, '[{"id": "faade783-ec12-418c-9226-ff63441569e8", "name": "Xtra Loaded Stack Burger", "price": 340, "quantity": 1}, {"id": "2392fa5d-8de3-428d-a31f-1d82bec91fd1", "name": "Xtra Stack Burger", "price": 290, "quantity": 1}]', 'Table 01', '2026-08-25 09:59:04.834+00', '2026-08-25 15:29:04', '+91 9922441812', 'Shravan', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('054f567c-9d29-453b-8ead-b5c2550e08d3', 'KOT-4258', 'completed', 262.50, '[{"id": "10450098-de8e-4e50-b07b-f964f057d87a", "name": "Crunchy Royale Burger", "notes": "", "price": 250.0, "total": 250.0, "item_id": "c9c0651f-b2c8-4fcf-a792-3806cfbc575d", "quantity": 1, "kot_round": 1}]', 'Table 01', '2026-08-22 14:17:36.259+00', '22-Aug-2026 07:47 PM', '+91 9922441812', 'Shravan', NULL, 0, 'dine_in', 'KOT Round #1', NULL, NULL),
	('86b5b610-5564-4096-a35e-65d2242494c6', 'BATCH-ZOM-260822-2692', 'completed', 550.00, '[{"id": "ITM-Z01", "isVeg": false, "price": 490, "addons": [{"id": "AD-01", "name": "Extra Mirchi Ka Salan", "price": 35}, {"id": "AD-02", "name": "Boiled Egg (2 pcs)", "price": 30}], "category": "Biryani", "itemName": "Hyderabadi Mutton Dum Biryani (Large)", "quantity": 2, "itemTotal": 1110, "specialNotes": "Extra spicy masala layer"}, {"id": "ITM-Z02", "isVeg": false, "price": 380, "addons": [], "category": "Starters", "itemName": "Galouti Kebab with Ulte Tawa Ka Paratha", "quantity": 1, "itemTotal": 380, "specialNotes": ""}, {"id": "ITM-Z03", "isVeg": true, "price": 140, "addons": [], "category": "Desserts", "itemName": "Gulab Jamun with Rabri (2 pcs)", "quantity": 1, "itemTotal": 140, "specialNotes": ""}]', 'Opposite Community Clubhouse', '2026-08-22 19:56:06.781953+00', '23/8/2026, 1:26:07 am', '+91 98450 11223', 'Vikramaditya Roy', NULL, 150, 'delivery', 'Address: Villa 14, Palm Meadows, Whitefield, Bengaluru (560066) | Payment: PREPAID', 'Batch Stress Test #6', 'ZOMATO'),
	('5b9d8bd5-09ac-4d51-b6f3-9cb7adf6b645', 'KOT-1555', 'completed', 556.50, '[{"id": "3fa25608-ec7f-4fe0-9b1e-3519328c161a", "name": "Crunchy Royale Burger", "notes": "", "price": 250.0, "total": 250.0, "item_id": "c9c0651f-b2c8-4fcf-a792-3806cfbc575d", "quantity": 1, "kot_round": 1}, {"id": "da0d6d7a-eb8a-4d35-a9c3-68ed26f19c9b", "name": "Grilled Chicken Burger", "notes": "", "price": 280.0, "total": 280.0, "item_id": "c7745ec2-4332-42e1-9688-d3abb6ee3b63", "quantity": 1, "kot_round": 1}]', 'Table 19', '2026-08-25 15:33:09.555+00', '25-Aug-2026 09:03 PM', NULL, 'Guest', NULL, 0, 'dine_in', 'KOT Round #1', NULL, NULL),
	('141aba6c-432c-4f3e-9562-5b9d150e78b5', '5740', 'completed', 560.00, '[{"id": "c7745ec2-4332-42e1-9688-d3abb6ee3b63", "name": "Grilled Chicken Burger", "price": 280, "quantity": 2}]', 'Table 01', '2026-09-16 00:40:26.954+00', '2026-09-16 06:10:26', '+91 8783 76667', 'Shravan', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('d2a96caf-08c6-4682-8e6a-fcbd18c7043f', '#9821', 'completed', 1667.00, '[{"id": "ITM-Z01", "qty": 2, "name": "Hyderabadi Mutton Dum Biryani (Large)", "isVeg": false, "notes": "Extra spicy masala layer", "price": 490, "addons": [{"id": "AD-01", "name": "Extra Mirchi Ka Salan", "price": 35}, {"id": "AD-02", "name": "Boiled Egg (2 pcs)", "price": 30}], "category": "Biryani", "itemName": "Hyderabadi Mutton Dum Biryani (Large)", "quantity": 2, "item_name": "Hyderabadi Mutton Dum Biryani (Large)", "specialNotes": "Extra spicy masala layer"}, {"id": "ITM-Z02", "qty": 1, "name": "Galouti Kebab with Ulte Tawa Ka Paratha", "isVeg": false, "notes": "", "price": 380, "addons": [], "category": "Starters", "itemName": "Galouti Kebab with Ulte Tawa Ka Paratha", "quantity": 1, "item_name": "Galouti Kebab with Ulte Tawa Ka Paratha", "specialNotes": ""}, {"id": "ITM-Z03", "qty": 1, "name": "Gulab Jamun with Rabri (2 pcs)", "isVeg": true, "notes": "", "price": 140, "addons": [], "category": "Desserts", "itemName": "Gulab Jamun with Rabri (2 pcs)", "quantity": 1, "item_name": "Gulab Jamun with Rabri (2 pcs)", "specialNotes": ""}]', 'VYOMA_BLR_01', '2026-08-19 17:56:49.399+00', '19/8/2026, 11:26:49 pm', '+91 98450 11223', 'Vikramaditya Roy', NULL, 150, 'delivery', '[ZOMATO] Order ID: VY-ZOM-9821', 'Pack extra salan & onion salad. Do not ring bell, infant sleeping.', 'zomato'),
	('a123d4ad-af33-4a33-907c-fbf9919f0629', '#9821', 'completed', 462.00, '[{"id": "ITM-Z01", "qty": 1, "name": "Xtra Loaded Stack Burger", "isVeg": true, "notes": "Extra spicy masala layer", "price": 340, "addons": [], "category": "Burgers", "itemName": "Xtra Loaded Stack Burger", "quantity": 1, "item_name": "Xtra Loaded Stack Burger", "specialNotes": "Extra spicy masala layer"}]', 'VYOMA_BLR_01', '2026-08-19 09:00:23.479+00', '19/8/2026, 2:30:23 pm', '+91 98450 11223', 'Vikramaditya Roy', NULL, NULL, 'delivery', '[ZOMATO] Order ID: VY-ZOM-9821', 'Pack extra salan & onion salad. Do not ring bell, infant sleeping.', 'zomato'),
	('25beb130-58ac-4884-aa32-cac50e106c80', '#9821', 'completed', 462.00, '[{"id": "ITM-Z03", "qty": 1, "name": "Xtra Loaded Stack Burger", "isVeg": true, "notes": "", "price": 340, "addons": [], "category": "Burgers", "itemName": "Xtra Loaded Stack Burger", "quantity": 1, "item_name": "Xtra Loaded Stack Burger", "specialNotes": ""}]', 'VYOMA_BLR_01', '2026-08-19 18:02:06.652+00', '19/8/2026, 11:32:07 pm', '+91 98450 11223', 'Vikramaditya Roy', NULL, NULL, 'delivery', '[ZOMATO] Order ID: VY-ZOM-9821', 'Pack extra salan & onion salad. Do not ring bell, infant sleeping.', 'zomato'),
	('1ef4cb08-724a-446a-abcc-938c8d769632', 'KOT-3160', 'completed', 556.50, '[{"id": "21f85d21-0cf9-4dc8-b940-f6faae4f62a4", "name": "Crunchy Royale Burger", "notes": "", "price": 250.0, "total": 250.0, "item_id": "c9c0651f-b2c8-4fcf-a792-3806cfbc575d", "quantity": 1, "kot_round": 1}, {"id": "9e6fddd6-1528-4bf0-ac56-8d906f6db4ce", "name": "Grilled Chicken Burger", "notes": "", "price": 280.0, "total": 280.0, "item_id": "c7745ec2-4332-42e1-9688-d3abb6ee3b63", "quantity": 1, "kot_round": 1}]', 'Table 01', '2026-08-25 15:35:35.16+00', '25-Aug-2026 09:05 PM', NULL, 'Guest', NULL, 0, 'dine_in', 'KOT Round #1', NULL, NULL),
	('3ff3f9c2-ba58-4226-a809-9c07bb5d9623', 'KOT-3722', 'completed', 556.50, '[{"id": "37a4a524-6340-4590-9d37-3b7c3fbcd918", "name": "Crunchy Royale Burger", "notes": "", "price": 250.0, "total": 250.0, "item_id": "c9c0651f-b2c8-4fcf-a792-3806cfbc575d", "quantity": 1, "kot_round": 1}, {"id": "09551555-f6fe-4287-b79a-f3cd8eb7810f", "name": "Grilled Chicken Burger", "notes": "", "price": 280.0, "total": 280.0, "item_id": "c7745ec2-4332-42e1-9688-d3abb6ee3b63", "quantity": 1, "kot_round": 1}]', 'Table 01', '2026-08-25 16:52:32.722+00', '25-Aug-2026 10:22 PM', NULL, 'Guest', NULL, 0, 'dine_in', 'KOT Round #1', NULL, NULL),
	('f25df005-0c8c-457f-8edd-5e444e8237bf', '2440', 'completed', 714.00, '[{"id": "faade783-ec12-418c-9226-ff63441569e8", "name": "Xtra Loaded Stack Burger", "price": 340, "quantity": 2}]', 'Table 01', '2026-10-06 16:58:14.728+00', '2026-10-06 22:28:14', '+918788376667', 'Shravan b', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('2109aaa9-7797-4bc7-9ed9-070fe8b0ebfb', 'TOK-1055', 'completed', 0.00, '[]', NULL, '2026-08-19 19:27:47.352042+00', '20/8/2026, 12:57:46 am', NULL, NULL, NULL, 0, 'dine_in', NULL, NULL, 'ZOMATO'),
	('0b3c1425-8a4d-4443-b925-70af786e1fdc', '7714', 'completed', 580.00, '[{"id": "2392fa5d-8de3-428d-a31f-1d82bec91fd1", "name": "Xtra Stack Burger", "price": 290, "quantity": 2}]', 'Table 02', '2026-09-01 10:03:07.137+00', '2026-09-01 15:33:07', NULL, 'Guest', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('45847d15-2221-4639-8f02-358f7f56d0ef', 'KOT-1196', 'completed', 1113.00, '[{"id": "21c1e580-2504-4fe8-9c14-bff144aff596", "name": "Crunchy Royale Burger", "notes": "", "price": 250.0, "total": 250.0, "item_id": "c9c0651f-b2c8-4fcf-a792-3806cfbc575d", "quantity": 1, "kot_round": 1}, {"id": "ffbf0906-2fb1-4e53-b101-025aa8e1d349", "name": "Grilled Chicken Burger", "notes": "", "price": 280.0, "total": 280.0, "item_id": "c7745ec2-4332-42e1-9688-d3abb6ee3b63", "quantity": 1, "kot_round": 1}, {"id": "643fc632-105e-4fae-bc04-94fd02a6709a", "name": "Crunchy Royale Burger", "notes": "", "price": 250.0, "total": 250.0, "item_id": "c9c0651f-b2c8-4fcf-a792-3806cfbc575d", "quantity": 1, "kot_round": 2}, {"id": "f6f7d4e6-5cbc-4086-843e-611a3f2a8d89", "name": "Grilled Chicken Burger", "notes": "", "price": 280.0, "total": 280.0, "item_id": "c7745ec2-4332-42e1-9688-d3abb6ee3b63", "quantity": 1, "kot_round": 2}]', 'Table 01', '2026-08-25 14:59:51.196+00', '25-Aug-2026 08:29 PM', NULL, 'Guest', NULL, 0, 'dine_in', 'KOT Round #2', NULL, NULL),
	('1f46a3e0-8cf2-4f7c-a2b3-0837edaf4fea', 'VY-ZOM-261006-5518', 'completed', 462.00, '[{"id": "ITM-01", "isVeg": false, "price": 340, "addons": [], "category": "Burgers", "itemName": "Xtra Loaded Stack Burger", "quantity": 1, "itemTotal": 340, "specialNotes": ""}]', 'Opposite Community Clubhouse', '2026-10-06 15:16:33.384217+00', '6/10/2026, 8:46:32 pm', '+91 99224 41812', 'Shravan', NULL, 0, 'delivery', 'Address: Villa 14, Palm Meadows, Whitefield, Bengaluru (560066) | Payment: PREPAID', 'Pack extra ketchup & napkins. Ring doorbell once.', 'ZOMATO'),
	('94817982-0d4b-444d-ac15-f9bb064eabc5', 'KOT-7083', 'completed', 556.50, '[{"id": "6c7b6491-ac37-42af-8ddc-2a0f489d7cd7", "name": "Grilled Chicken Burger", "notes": "", "price": 280.0, "total": 280.0, "item_id": "c7745ec2-4332-42e1-9688-d3abb6ee3b63", "quantity": 1, "kot_round": 1}, {"id": "dd910667-4a13-417e-9e9b-7b2091b753ee", "name": "Crunchy Royale Burger", "notes": "", "price": 250.0, "total": 250.0, "item_id": "c9c0651f-b2c8-4fcf-a792-3806cfbc575d", "quantity": 1, "kot_round": 1}]', 'Table 01', '2026-08-25 15:43:00.083+00', '25-Aug-2026 09:13 PM', NULL, 'Guest', NULL, 0, 'dine_in', 'KOT Round #1', NULL, NULL),
	('a3f59e92-7091-4bb5-913a-69db4c5de731', '5401', 'completed', 2730.00, '[{"id": "faade783-ec12-418c-9226-ff63441569e8", "name": "Xtra Loaded Stack Burger", "price": 340, "quantity": 3}, {"id": "c7745ec2-4332-42e1-9688-d3abb6ee3b63", "name": "Grilled Chicken Burger", "price": 280, "quantity": 3}, {"id": "2392fa5d-8de3-428d-a31f-1d82bec91fd1", "name": "Xtra Stack Burger", "price": 290, "quantity": 3}]', 'Table 01', '2026-09-04 12:45:25.111+00', '2026-09-04 18:15:25', '+91 9922441812', 'Shravan', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('22cf01d0-0077-435c-8fb1-a622e7333402', 'KOT-9196', 'completed', 294.00, '[{"id": "63dca507-fd6d-47d2-b0a7-11a538189fb5", "name": "Grilled Chicken Burger", "notes": "", "price": 280.0, "total": 280.0, "item_id": "c7745ec2-4332-42e1-9688-d3abb6ee3b63", "quantity": 1, "kot_round": 1}]', 'Table 01', '2026-09-19 06:56:59.196+00', '19-Sep-2026 12:26 PM', '+91 9922441812', 'Shravan', NULL, 0, 'dine_in', 'KOT Round #1', NULL, NULL),
	('269d73dd-ff56-45f0-9551-a83510a1ec35', 'BATCH-PET-260822-2870', 'completed', 550.00, '[{"id": "ITM-P01", "isVeg": false, "price": 360, "addons": [], "category": "Thali Meals", "itemName": "Chicken Dum Biryani Executive Thali", "quantity": 4, "itemTotal": 1440, "specialNotes": ""}, {"id": "ITM-P02", "isVeg": true, "price": 320, "addons": [], "category": "Thali Meals", "itemName": "Special Paneer Tikka Thali", "quantity": 3, "itemTotal": 960, "specialNotes": ""}, {"id": "ITM-P03", "isVeg": true, "price": 90, "addons": [], "category": "Beverages", "itemName": "Fresh Sweet Lime Juice (500ml)", "quantity": 7, "itemTotal": 630, "specialNotes": ""}]', 'Gate 2 Security Desk', '2026-08-22 19:56:21.203421+00', '23/8/2026, 1:26:21 am', '+91 98800 22334', 'Tech Mahindra Lunch Group (Attn: Rahul)', NULL, 220, 'delivery', 'Address: Tower 3, 5th Floor Reception, Electronic City Phase 1, Bengaluru (560100) | Payment: PREPAID', 'Batch Stress Test #10', 'PETPOOJA'),
	('d625b291-dc64-4c3f-9924-471200d410b3', 'KOT-1353', 'completed', 556.50, '[{"id": "e884d8db-623b-4c38-8ad8-697db39383fc", "name": "Crunchy Royale Burger", "notes": "", "price": 250.0, "total": 250.0, "item_id": "c9c0651f-b2c8-4fcf-a792-3806cfbc575d", "quantity": 1, "kot_round": 1}, {"id": "fdfe675c-b8d3-4298-aa5c-f46b03f0735e", "name": "Grilled Chicken Burger", "notes": "", "price": 280.0, "total": 280.0, "item_id": "c7745ec2-4332-42e1-9688-d3abb6ee3b63", "quantity": 1, "kot_round": 1}]', 'Table 01', '2026-08-25 16:56:06.353+00', '25-Aug-2026 10:26 PM', NULL, 'Guest', NULL, 0, 'dine_in', 'KOT Round #1', NULL, NULL),
	('be090a28-3bc9-4d2b-a609-59b4475035a1', '9198', 'completed', 340.00, '[{"id": "faade783-ec12-418c-9226-ff63441569e8", "name": "Xtra Loaded Stack Burger", "price": 340, "quantity": 1}]', 'Table 01', '2026-09-21 11:58:20.857+00', '2026-09-21 17:28:20', '+918788376667', 'Shravan', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('c0b7ed0c-491c-46e3-84c2-b2405e2a28c1', 'KOT-4100', 'completed', 556.50, '[{"id": "d49f5bd0-cd59-4f94-b57d-4aede94cbfae", "name": "Crunchy Royale Burger", "notes": "", "price": 250.0, "total": 250.0, "item_id": "c9c0651f-b2c8-4fcf-a792-3806cfbc575d", "quantity": 1, "kot_round": 1}, {"id": "3cda2564-6ffe-40c7-b02c-5124bb39a506", "name": "Grilled Chicken Burger", "notes": "", "price": 280.0, "total": 280.0, "item_id": "c7745ec2-4332-42e1-9688-d3abb6ee3b63", "quantity": 1, "kot_round": 1}]', 'Table 01', '2026-08-25 18:14:36.1+00', '25-Aug-2026 11:44 PM', NULL, 'Guest', NULL, 0, 'dine_in', 'KOT Round #1', NULL, NULL),
	('9ae21ce4-4743-4f96-8ab8-0674159171da', 'VY-ZOM-9821', 'completed', 462.00, '[{"id": "ITM-01", "isVeg": false, "price": 340, "addons": [], "category": "Burgers", "itemName": "Xtra Loaded Stack Burger", "quantity": 1, "itemTotal": 340, "specialNotes": ""}]', 'Opposite Community Clubhouse', '2026-10-06 15:15:26.39704+00', '6/10/2026, 8:45:25 pm', '+91 99224 41812', 'Shravan', NULL, 0, 'delivery', 'Address: Villa 14, Palm Meadows, Whitefield, Bengaluru (560066) | Payment: PREPAID', 'Pack extra ketchup & napkins. Ring doorbell once.', 'ZOMATO'),
	('5ec1fc75-4a6b-4cc7-88c1-46b149aae2f6', '2982', 'completed', 220.00, '[{"id": "6a005377-56f0-4926-8cb9-4a475045f20d", "name": "Veg Herb Delight Burger", "price": 220, "quantity": 1}]', 'Table 01', '2026-09-16 02:01:35.399+00', '2026-09-16 07:31:35', '91+ 87883 76667', 'Shravan b', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('54405cba-11ab-4eff-b61b-67ab1ede4aff', '1202', 'completed', 680.00, '[{"id": "faade783-ec12-418c-9226-ff63441569e8", "name": "Xtra Loaded Stack Burger", "price": 340, "quantity": 2}]', 'Table 01', '2026-09-16 02:00:21.867+00', '2026-09-16 07:30:21', '91+ 87883 76667', 'Shravan b', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('a5724c66-922a-402a-b632-0452f9f5d7bd', 'KOT-6524', 'completed', 556.50, '[{"id": "c1ae2d53-5474-482a-8f94-1a7614648a35", "name": "Grilled Chicken Burger", "notes": "", "price": 280.0, "total": 280.0, "item_id": "c7745ec2-4332-42e1-9688-d3abb6ee3b63", "quantity": 1, "kot_round": 1}, {"id": "f4f92b63-7c6f-4b3c-8776-63bb1a3742e1", "name": "Crunchy Royale Burger", "notes": "", "price": 250.0, "total": 250.0, "item_id": "c9c0651f-b2c8-4fcf-a792-3806cfbc575d", "quantity": 1, "kot_round": 1}]', 'Table 01', '2026-08-25 15:15:32.524+00', '25-Aug-2026 08:45 PM', NULL, 'Guest', NULL, 0, 'dine_in', 'KOT Round #1', NULL, NULL),
	('837f11cd-c535-4849-8249-4eaf52815ab2', 'KOT-7004', 'completed', 2194.50, '[{"id": "0e9fff80-b7f0-49eb-bfcc-bc985d00538d", "name": "Crunchy Royale Burger", "notes": "", "price": 250.0, "total": 250.0, "item_id": "c9c0651f-b2c8-4fcf-a792-3806cfbc575d", "quantity": 1, "kot_round": 1}, {"id": "c69b5167-d133-4566-994c-f9845cc14ff0", "name": "Grilled Chicken Burger", "notes": "", "price": 280.0, "total": 280.0, "item_id": "c7745ec2-4332-42e1-9688-d3abb6ee3b63", "quantity": 1, "kot_round": 1}, {"id": "88a9f26d-2b1b-46e6-a51c-85f11f65062d", "name": "Grilled Chicken Burger", "notes": "", "price": 280.0, "total": 560.0, "item_id": "c7745ec2-4332-42e1-9688-d3abb6ee3b63", "quantity": 2, "kot_round": 2}, {"id": "9fca1fa2-11e5-4215-a3fd-8844ced8f7e7", "name": "Crunchy Royale Burger", "notes": "", "price": 250.0, "total": 500.0, "item_id": "c9c0651f-b2c8-4fcf-a792-3806cfbc575d", "quantity": 2, "kot_round": 2}, {"id": "77f0ede6-7518-4287-a6aa-5dea84e336f7", "name": "Grilled Chicken Burger", "notes": "", "price": 280.0, "total": 280.0, "item_id": "c7745ec2-4332-42e1-9688-d3abb6ee3b63", "quantity": 1, "kot_round": 3}, {"id": "4b499952-5ba9-4fd7-99a3-516c39fcc3f2", "name": "Veg Herb Delight Burger", "notes": "", "price": 220.0, "total": 220.0, "item_id": "6a005377-56f0-4926-8cb9-4a475045f20d", "quantity": 1, "kot_round": 4}]', 'Table 01', '2026-08-22 14:36:15.004+00', '22-Aug-2026 08:06 PM', '+91 9922441812', 'Shravan', NULL, 0, 'dine_in', 'KOT Round #4', NULL, NULL),
	('97726d5f-025e-41b1-a49c-74a6657e712a', 'KOT-2759', 'completed', 556.50, '[{"id": "c8b514d1-04cf-4e20-a635-e4aafea4ab4f", "name": "Crunchy Royale Burger", "notes": "", "price": 250.0, "total": 250.0, "item_id": "c9c0651f-b2c8-4fcf-a792-3806cfbc575d", "quantity": 1, "kot_round": 1}, {"id": "32480324-a451-4410-8577-83e9484b4e07", "name": "Grilled Chicken Burger", "notes": "", "price": 280.0, "total": 280.0, "item_id": "c7745ec2-4332-42e1-9688-d3abb6ee3b63", "quantity": 1, "kot_round": 1}]', 'Table 01', '2026-08-25 16:29:52.759+00', '25-Aug-2026 09:59 PM', NULL, 'Guest', NULL, 0, 'dine_in', 'KOT Round #1', NULL, NULL),
	('d850be8a-cbd1-4950-96cd-b7ef62809734', 'BATCH-ZOM-260822-8519', 'completed', 550.00, '[{"id": "ITM-Z01", "isVeg": false, "price": 490, "addons": [{"id": "AD-01", "name": "Extra Mirchi Ka Salan", "price": 35}, {"id": "AD-02", "name": "Boiled Egg (2 pcs)", "price": 30}], "category": "Biryani", "itemName": "Hyderabadi Mutton Dum Biryani (Large)", "quantity": 2, "itemTotal": 1110, "specialNotes": "Extra spicy masala layer"}, {"id": "ITM-Z02", "isVeg": false, "price": 380, "addons": [], "category": "Starters", "itemName": "Galouti Kebab with Ulte Tawa Ka Paratha", "quantity": 1, "itemTotal": 380, "specialNotes": ""}, {"id": "ITM-Z03", "isVeg": true, "price": 140, "addons": [], "category": "Desserts", "itemName": "Gulab Jamun with Rabri (2 pcs)", "quantity": 1, "itemTotal": 140, "specialNotes": ""}]', 'Opposite Community Clubhouse', '2026-08-22 19:55:48.142461+00', '23/8/2026, 1:25:47 am', '+91 98450 11223', 'Vikramaditya Roy', NULL, 150, 'delivery', 'Address: Villa 14, Palm Meadows, Whitefield, Bengaluru (560066) | Payment: PREPAID', 'Batch Stress Test #1', 'ZOMATO'),
	('84d212b0-2434-4df1-89db-6e630aa622df', 'KOT-4825', 'completed', 556.50, '[{"id": "ee21a887-8620-4829-a181-d2787e050a92", "name": "Crunchy Royale Burger", "notes": "", "price": 250.0, "total": 250.0, "item_id": "c9c0651f-b2c8-4fcf-a792-3806cfbc575d", "quantity": 1, "kot_round": 1}, {"id": "241766a7-8777-4b31-8a38-6f9df585bd1b", "name": "Grilled Chicken Burger", "notes": "", "price": 280.0, "total": 280.0, "item_id": "c7745ec2-4332-42e1-9688-d3abb6ee3b63", "quantity": 1, "kot_round": 1}]', 'Table 01', '2026-08-25 17:58:24.825+00', '25-Aug-2026 11:28 PM', NULL, 'Guest', NULL, 0, 'dine_in', 'KOT Round #1', NULL, NULL),
	('cd7963c7-874c-4e7a-84d6-a1e92794571c', 'BATCH-DIR-260822-5306', 'completed', 550.00, '[{"id": "ITM-D01", "isVeg": true, "price": 240, "addons": [{"id": "AD-D1", "name": "Mint Chutney Bottle (100ml)", "price": 30}], "category": "Tandoor Starters", "itemName": "Tandoori Soya Chaap Tikka", "quantity": 1, "itemTotal": 270, "specialNotes": ""}, {"id": "ITM-D02", "isVeg": true, "price": 210, "addons": [], "category": "Combos", "itemName": "Paneer Kulcha with Chole", "quantity": 2, "itemTotal": 420, "specialNotes": ""}]', 'Customer will collect in 20 mins', '2026-08-22 19:56:17.796061+00', '23/8/2026, 1:26:18 am', '+91 91234 98765', 'Ananya Iyer', NULL, 50, 'delivery', 'Address: Store Pickup Counter - Vyoma Express, Bengaluru (560001) | Payment: PREPAID', 'Batch Stress Test #9', 'DIRECT_WEB'),
	('f991aae6-640a-417b-96c9-571285a47c55', 'KOT-8965', 'completed', 588.00, '[{"id": "27035832-61a6-4b80-a052-52d96af99f14", "name": "Grilled Chicken Burger", "notes": "", "price": 280.0, "total": 560.0, "item_id": "c7745ec2-4332-42e1-9688-d3abb6ee3b63", "quantity": 2, "kot_round": 1}]', 'Table 01', '2026-08-23 10:39:34.965+00', '23-Aug-2026 04:09 PM', '+91 9922441812', 'Shravan', NULL, 0, 'dine_in', 'KOT Round #1', NULL, NULL),
	('c23a87b5-ad25-4709-9627-e923e8ac5a5b', 'KOT-9055', 'completed', 556.50, '[{"id": "3daa5a81-fb74-4595-9437-e30e2f75f774", "name": "Crunchy Royale Burger", "notes": "", "price": 250.0, "total": 250.0, "item_id": "c9c0651f-b2c8-4fcf-a792-3806cfbc575d", "quantity": 1, "kot_round": 1}, {"id": "766fe533-b5b9-4749-97fe-861fa6bb2cfe", "name": "Grilled Chicken Burger", "notes": "", "price": 280.0, "total": 280.0, "item_id": "c7745ec2-4332-42e1-9688-d3abb6ee3b63", "quantity": 1, "kot_round": 1}]', 'Table 01', '2026-08-27 17:17:32.055+00', '27-Aug-2026 10:47 PM', NULL, 'Guest', NULL, 0, 'dine_in', 'KOT Round #1', NULL, NULL),
	('24d8a244-d92f-4636-bb1b-6aa2f9e5c444', '7156', 'completed', 246.50, '[{"id": "dba1e8c0-890c-4803-af8f-d95b813188c6", "name": "Aglio Olio", "image": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500", "price": 290, "quantity": 1}]', '3', '2026-08-23 10:42:41.524565+00', '23 Aug 2026, 4:12:40 pm', '+91 7040202269', 'Anish', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('22dade81-d6e1-432b-81bf-b9915a77d4c6', 'VY-ZOM-261006-2365', 'completed', 462.00, '[{"id": "ITM-01", "isVeg": false, "price": 340, "addons": [], "category": "Burgers", "itemName": "Xtra Loaded Stack Burger", "quantity": 1, "itemTotal": 340, "specialNotes": ""}]', 'Opposite Community Clubhouse', '2026-10-06 15:16:52.970119+00', '6/10/2026, 8:46:52 pm', '+91 99224 41812', 'Shravan', NULL, 0, 'delivery', 'Address: Villa 14, Palm Meadows, Whitefield, Bengaluru (560066) | Payment: PREPAID', 'Pack extra ketchup & napkins. Ring doorbell once.', 'ZOMATO'),
	('19e75824-28fb-4be8-ad98-827184acfa56', '6629', 'completed', 1020.00, '[{"id": "faade783-ec12-418c-9226-ff63441569e8", "name": "Xtra Loaded Stack Burger", "price": 340, "quantity": 3}]', 'Table 01', '2026-09-04 13:09:31.072+00', '2026-09-04 18:39:31', '91+ 87883 76667', 'Shravan b', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('3e206b46-0f5a-4835-87f9-7e1c156ca0cc', '1065', 'completed', 246.50, '[{"id": "dba1e8c0-890c-4803-af8f-d95b813188c6", "name": "Aglio Olio", "image": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500", "price": 290, "quantity": 1}]', '3', '2026-08-22 19:54:01.1557+00', '23 Aug 2026, 1:23:59 am', '+91 7040202269', 'Anish', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('e4093b38-2865-4b25-a2f4-ba85ea1e24fc', '4667', 'completed', 1120.00, '[{"id": "c7745ec2-4332-42e1-9688-d3abb6ee3b63", "name": "Grilled Chicken Burger", "price": 280, "quantity": 4}]', 'Table 01', '2026-09-19 13:36:34.794+00', '2026-09-19 19:06:34', NULL, 'Guest', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('eee208a9-a24e-452e-84c7-1e458be877b3', 'ZOM-5519', 'completed', 340.00, '[{"id": "faade783-ec12-418c-9226-ff63441569e8", "name": "Xtra Loaded Stack Burger", "price": 340, "quantity": 1}]', 'Online', '2026-09-01 09:59:03.798+00', '2026-09-01 15:29:03', NULL, 'Guest', NULL, NULL, 'aggregator', 'Online order via ZOMATO', NULL, 'zomato'),
	('c9d81cdb-e46f-4f7b-aaf7-10330cd71d42', '6793', 'completed', 340.00, '[{"id": "faade783-ec12-418c-9226-ff63441569e8", "name": "Xtra Loaded Stack Burger", "price": 340, "quantity": 1}]', 'Table 01', '2026-09-04 13:10:49.585+00', '2026-09-04 18:40:49', '91+ 87883 76667', 'Shravan b', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('a985daa3-9348-4d3a-b604-ee71e9cf7f10', 'BATCH-SWI-260822-2689', 'completed', 550.00, '[{"id": "ITM-S01", "isVeg": true, "price": 320, "addons": [{"id": "AD-S1", "name": "Extra Cashew Gravy", "price": 45}], "category": "Main Course Veg", "itemName": "Paneer Butter Masala (Handi Special)", "quantity": 1, "itemTotal": 365, "specialNotes": ""}, {"id": "ITM-S02", "isVeg": true, "price": 290, "addons": [], "category": "Main Course Veg", "itemName": "Dal Makhani Slow Cooked 24hrs", "quantity": 1, "itemTotal": 290, "specialNotes": ""}, {"id": "ITM-S03", "isVeg": true, "price": 65, "addons": [], "category": "Breads", "itemName": "Butter Garlic Naan", "quantity": 4, "itemTotal": 260, "specialNotes": ""}, {"id": "ITM-S04", "isVeg": true, "price": 180, "addons": [], "category": "Rice", "itemName": "Jeera Rice with Crispy Fried Onions", "quantity": 1, "itemTotal": 180, "specialNotes": ""}]', 'Tower B, 7th Floor', '2026-08-22 19:55:51.235754+00', '23/8/2026, 1:25:51 am', '+91 97654 88990', 'Pooja Deshmukh', NULL, 80, 'delivery', 'Address: B-703, Mantri Espana, Bellandur Outer Ring Road, Bengaluru (560103) | Payment: ONLINE', 'Batch Stress Test #2', 'SWIGGY'),
	('6dfea4de-f925-49ce-986e-dd54089587d2', 'VY-ZOM-9821', 'completed', 462.00, '[{"id": "ITM-01", "isVeg": false, "price": 340, "addons": [], "category": "Burgers", "itemName": "Xtra Loaded Stack Burger", "quantity": 1, "itemTotal": 340, "specialNotes": ""}]', 'Opposite Community Clubhouse', '2026-09-01 11:29:01.575006+00', '1/9/2026, 4:59:00 pm', '+91 99224 41812', 'Shravan', NULL, 0, 'delivery', 'Address: Villa 14, Palm Meadows, Whitefield, Bengaluru (560066) | Payment: PREPAID', 'Pack extra ketchup & napkins. Ring doorbell once.', 'ZOMATO'),
	('703b6bb2-353f-45b8-bf6b-a85dde50a9f6', 'BATCH-MAG-260822-1588', 'completed', 550.00, '[{"id": "ITM-M01", "isVeg": false, "price": 260, "addons": [{"id": "AD-M1", "name": "Extra Cheddar Cheese Slice", "price": 30}, {"id": "AD-M2", "name": "Spicy Peri Peri Dip", "price": 25}], "category": "Burgers", "itemName": "Crispy Double Patty Chicken Burger", "quantity": 2, "itemTotal": 630, "specialNotes": ""}, {"id": "ITM-M02", "isVeg": true, "price": 180, "addons": [], "category": "Sides", "itemName": "Loaded Cheesy Fries (Jumbo)", "quantity": 1, "itemTotal": 180, "specialNotes": ""}, {"id": "ITM-M03", "isVeg": true, "price": 130, "addons": [], "category": "Beverages", "itemName": "Cold Coffee with Choco Ice Cream", "quantity": 2, "itemTotal": 260, "specialNotes": ""}]', 'Next to Sony Signal Cafe', '2026-08-22 19:55:55.251921+00', '23/8/2026, 1:25:55 am', '+91 99887 66554', 'Karan Mehra', NULL, 120, 'delivery', 'Address: Room 204, Stanza Living PG, Koramangala 4th Block, Bengaluru (560034) | Payment: COD', 'Batch Stress Test #3', 'MAGICPIN'),
	('046014ae-33bd-4598-bf49-2474664cf62f', '8231', 'completed', 290.00, '[{"id": "2392fa5d-8de3-428d-a31f-1d82bec91fd1", "name": "Xtra Stack Burger", "price": 290, "quantity": 1}]', 'Table 01', '2026-09-21 12:00:20.99+00', '2026-09-21 17:30:20', '+918788376667', 'Shravan', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('9cee63ae-12a4-4efe-acf8-4ff749b44c66', 'BATCH-DIR-260822-2076', 'completed', 550.00, '[{"id": "ITM-D01", "isVeg": true, "price": 240, "addons": [{"id": "AD-D1", "name": "Mint Chutney Bottle (100ml)", "price": 30}], "category": "Tandoor Starters", "itemName": "Tandoori Soya Chaap Tikka", "quantity": 1, "itemTotal": 270, "specialNotes": ""}, {"id": "ITM-D02", "isVeg": true, "price": 210, "addons": [], "category": "Combos", "itemName": "Paneer Kulcha with Chole", "quantity": 2, "itemTotal": 420, "specialNotes": ""}]', 'Customer will collect in 20 mins', '2026-08-22 19:55:59.248164+00', '23/8/2026, 1:25:59 am', '+91 91234 98765', 'Ananya Iyer', NULL, 50, 'delivery', 'Address: Store Pickup Counter - Vyoma Express, Bengaluru (560001) | Payment: PREPAID', 'Batch Stress Test #4', 'DIRECT_WEB'),
	('b5cac828-152a-485b-955b-6fb7a8a8f0f1', '1943', 'completed', 580.00, '[{"id": "2392fa5d-8de3-428d-a31f-1d82bec91fd1", "name": "Xtra Stack Burger", "price": 290, "quantity": 2}]', 'Table 01', '2026-09-16 02:00:51.627+00', '2026-09-16 07:30:51', NULL, 'Shravan b', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('c50e5569-2d7e-490e-bc8f-6155eb9fde7a', 'BATCH-PET-260822-4730', 'completed', 550.00, '[{"id": "ITM-P01", "isVeg": false, "price": 360, "addons": [], "category": "Thali Meals", "itemName": "Chicken Dum Biryani Executive Thali", "quantity": 4, "itemTotal": 1440, "specialNotes": ""}, {"id": "ITM-P02", "isVeg": true, "price": 320, "addons": [], "category": "Thali Meals", "itemName": "Special Paneer Tikka Thali", "quantity": 3, "itemTotal": 960, "specialNotes": ""}, {"id": "ITM-P03", "isVeg": true, "price": 90, "addons": [], "category": "Beverages", "itemName": "Fresh Sweet Lime Juice (500ml)", "quantity": 7, "itemTotal": 630, "specialNotes": ""}]', 'Gate 2 Security Desk', '2026-08-22 19:56:03.186502+00', '23/8/2026, 1:26:03 am', '+91 98800 22334', 'Tech Mahindra Lunch Group (Attn: Rahul)', NULL, 220, 'delivery', 'Address: Tower 3, 5th Floor Reception, Electronic City Phase 1, Bengaluru (560100) | Payment: PREPAID', 'Batch Stress Test #5', 'PETPOOJA'),
	('d29e0863-de65-4c63-a9cd-313f0b119fc1', 'KOT-5923', 'completed', 882.00, '[{"id": "ade7297f-9e22-4e64-bbc6-bbe44ae9ce5f", "name": "Grilled Chicken Burger", "notes": "", "price": 280.0, "total": 840.0, "item_id": "c7745ec2-4332-42e1-9688-d3abb6ee3b63", "quantity": 3, "kot_round": 1}]', 'Table 01', '2026-08-23 10:47:55.924+00', '23-Aug-2026 04:17 PM', '+91 9922441812', 'Shravan', NULL, 0, 'dine_in', 'KOT Round #1', NULL, NULL),
	('4d5074ff-27cc-48ec-a628-ed85d48f9568', '8983', 'completed', 680.00, '[{"id": "faade783-ec12-418c-9226-ff63441569e8", "name": "Xtra Loaded Stack Burger", "price": 340, "quantity": 2}]', 'Table 01', '2026-09-16 02:59:52.32+00', '2026-09-16 08:29:52', '91+ 87883 76667', 'Shravan b', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('cea6bbaf-9eda-4aac-ad11-5e67b6787059', '4739', 'completed', 340.00, '[{"id": "faade783-ec12-418c-9226-ff63441569e8", "name": "Xtra Loaded Stack Burger", "price": 340, "quantity": 1}]', 'Table 01', '2026-09-04 13:16:41.62+00', '2026-09-04 18:46:41', '91+ 87883 76667', 'Shravan b', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('820698be-c546-45f0-aa11-5771b2d995ea', '1881', 'completed', 340.00, '[{"id": "faade783-ec12-418c-9226-ff63441569e8", "name": "Xtra Loaded Stack Burger", "price": 340, "quantity": 1}]', 'Table 01', '2026-09-04 13:17:51.145+00', '2026-09-04 18:47:51', '91+ 87883 76667', 'Shravan b', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('54bdb749-3a7f-47cd-af89-611dcd1a714d', '4031', 'completed', 340.00, '[{"id": "faade783-ec12-418c-9226-ff63441569e8", "name": "Xtra Loaded Stack Burger", "price": 340, "quantity": 1}]', 'Table 01', '2026-09-20 18:18:42.922+00', '2026-09-20 23:48:42', '91+87883766', 'Shravan b', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('89a743bf-4f20-4c65-8a8f-53d9185612f5', 'TOK-2747', 'completed', 0.00, '[]', NULL, '2026-10-06 15:21:05.047436+00', '6/10/2026, 8:51:03 pm', NULL, NULL, NULL, 0, 'dine_in', NULL, NULL, 'ZOMATO'),
	('c8296759-d318-4e7b-9f8e-50c29c9582d3', 'ZOM-1791391352612', 'completed', 0.00, '[{"name": "Paneer Butter Masala", "price": 320, "itemId": "ITEM-101", "quantity": 1, "customizations": [{"name": "Spicy Level", "option": "Medium"}]}, {"name": "Butter Naan", "price": 40, "itemId": "ITEM-202", "quantity": 3}]', NULL, '2026-10-07 16:42:35.592608+00', '7/10/2026, 10:12:34 pm', NULL, NULL, NULL, 0, 'dine_in', NULL, NULL, 'ZOMATO'),
	('9d08e807-3a36-4871-8b3e-d411332e66c5', 'VY-SW-7668', 'completed', 462.00, '[{"id": "ITM-01", "isVeg": true, "price": 320, "addons": [], "category": "Main Course", "itemName": "Paneer Butter Masala", "quantity": 1, "itemTotal": 320, "specialNotes": ""}, {"id": "ITM-02", "isVeg": true, "price": 40, "addons": [], "category": "Breads", "itemName": "Butter Naan", "quantity": 3, "itemTotal": 120, "specialNotes": ""}]', 'Katraj', '2026-10-07 17:39:55.543592+00', '7/10/2026, 11:09:54 pm', '+91 99224 41812', 'Shravan Bhokase', NULL, 0, 'delivery', 'Address: Katraj, Pune, Pune (411046) | Payment: PREPAID', NULL, 'SWIGGY'),
	('37df1edc-2980-4381-9c43-ace4c5c7ad89', 'VY-ZOM-9821', 'completed', 462.00, '[{"id": "ITM-Z03", "isVeg": true, "price": 340, "addons": [], "category": "Burgers", "itemName": "Xtra Loaded Stack Burger", "quantity": 1, "itemTotal": 340, "specialNotes": ""}]', 'Opposite Community Clubhouse', '2026-08-19 18:26:12.887062+00', '19/8/2026, 11:56:11 pm', '+91 98450 11223', 'Vikramaditya Roy', NULL, 0, 'delivery', 'Address: Villa 14, Palm Meadows, Whitefield, Bengaluru (560066) | Payment: PREPAID', 'Pack extra salan & onion salad. Do not ring bell, infant sleeping.', 'ZOMATO'),
	('b23fcd82-92fb-4b15-aa3e-bfe78cf06750', 'VY-ZOM-9821', 'completed', 462.00, '[{"id": "ITM-01", "isVeg": false, "price": 340, "addons": [], "category": "Burgers", "itemName": "Xtra Loaded Stack Burger", "quantity": 1, "itemTotal": 340, "specialNotes": ""}]', 'Opposite Community Clubhouse', '2026-09-25 18:15:12.729196+00', '25/9/2026, 11:45:09 pm', '+91 99224 41812', 'Shravan', NULL, 0, 'delivery', 'Address: Villa 14, Palm Meadows, Whitefield, Bengaluru (560066) | Payment: PREPAID', 'Pack extra ketchup & napkins. Ring doorbell once.', 'ZOMATO'),
	('d22a61ed-a6d3-43d6-9e53-73f5a4127124', 'VY-ZOM-9821', 'completed', 462.00, '[{"id": "ITM-01", "isVeg": true, "price": 340, "addons": [], "category": "Burgers", "itemName": "Xtra Loaded Stack Burger", "quantity": 1, "itemTotal": 340, "specialNotes": ""}]', 'Opposite Community Clubhouse', '2026-09-01 11:27:45.027168+00', '1/9/2026, 4:57:44 pm', '+91 99224 41812', 'Shravan', NULL, 0, 'delivery', 'Address: Villa 14, Palm Meadows, Whitefield, Bengaluru (560066) | Payment: PREPAID', 'Pack extra ketchup & napkins. Ring doorbell once.', 'ZOMATO'),
	('2c8ecda0-54ae-4f87-ac76-baac69cc1aa3', 'VY-ZOM-9821', 'completed', 462.00, '[{"id": "ITM-01", "isVeg": false, "price": 340, "addons": [], "category": "Burgers", "itemName": "Xtra Loaded Stack Burger", "quantity": 1, "itemTotal": 340, "specialNotes": ""}]', 'Opposite Community Clubhouse', '2026-09-03 09:49:45.5513+00', '3/9/2026, 3:19:44 pm', '+91 99224 41812', 'Shravan', NULL, 0, 'delivery', 'Address: Villa 14, Palm Meadows, Whitefield, Bengaluru (560066) | Payment: PREPAID', 'Pack extra ketchup & napkins. Ring doorbell once.', 'ZOMATO'),
	('f27e6c78-6e20-4a0f-b074-4a1441e3e76c', '1109', 'completed', 440.00, '[{"id": "4b797755-7bd9-4d2c-8d2c-746af0306bad", "name": "Jalapeño Cheese Corn Balls", "price": 220, "quantity": 2}]', 'Table 01', '2026-09-16 03:00:14.577+00', '2026-09-16 08:30:14', '91+ 87883 76667', 'Shravan b', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('9da83e6b-195e-4cad-9eb0-67249a0643c0', '3283', 'completed', 340.00, '[{"id": "faade783-ec12-418c-9226-ff63441569e8", "name": "Xtra Loaded Stack Burger", "price": 340, "quantity": 1}]', 'Table 01', '2026-09-04 16:12:23.716+00', '2026-09-04 21:42:23', NULL, 'Guest', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('0f813a0d-2169-4175-916e-57effc4c005c', 'VY-SW-3797', 'completed', 462.00, '[{"id": "ITM-01", "isVeg": true, "price": 320, "addons": [], "category": "Main Course", "itemName": "Paneer Butter Masala", "quantity": 1, "itemTotal": 320, "specialNotes": ""}, {"id": "ITM-02", "isVeg": true, "price": 40, "addons": [], "category": "Breads", "itemName": "Butter Naan", "quantity": 3, "itemTotal": 120, "specialNotes": ""}]', 'Katraj', '2026-10-07 17:45:04.596527+00', '7/10/2026, 11:15:04 pm', '+91 99224 41812', 'Shravan Bhokase', NULL, 0, 'delivery', 'Address: Katraj, Pune, Pune (411046) | Payment: PREPAID', NULL, 'SWIGGY'),
	('e20bd3aa-9437-470a-acf9-d2802a6b345f', 'VY-ZOM-261006-1187', 'completed', 462.00, '[{"id": "ITM-01", "isVeg": false, "price": 340, "addons": [], "category": "Burgers", "itemName": "Xtra Loaded Stack Burger", "quantity": 1, "itemTotal": 340, "specialNotes": ""}]', 'Opposite Community Clubhouse', '2026-10-06 15:21:21.7893+00', '6/10/2026, 8:51:20 pm', '+91 99224 41812', 'Shravan', NULL, 0, 'delivery', 'Address: Villa 14, Palm Meadows, Whitefield, Bengaluru (560066) | Payment: PREPAID', 'Pack extra ketchup & napkins. Ring doorbell once.', 'ZOMATO'),
	('e078342d-2848-44ed-a083-5191c05b8e73', '1269', 'completed', 340.00, '[{"id": "faade783-ec12-418c-9226-ff63441569e8", "name": "Xtra Loaded Stack Burger", "price": 340, "quantity": 1}]', 'Table 01', '2026-09-04 16:13:16.627+00', '2026-09-04 21:43:16', '91+ 87883 76667', 'Shravan b', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('4257cbee-398a-4da7-86af-b9d74f95f631', 'SW-5570', 'completed', 0.00, '[]', NULL, '2026-10-07 17:14:31.656585+00', '7/10/2026, 10:44:30 pm', NULL, NULL, NULL, 0, 'dine_in', NULL, NULL, 'Swiggy'),
	('adc1ecd7-904c-4d61-903f-3346f455e169', '8799', 'completed', 340.00, '[{"id": "faade783-ec12-418c-9226-ff63441569e8", "name": "Xtra Loaded Stack Burger", "price": 340, "quantity": 1}]', 'Table 01', '2026-09-20 18:19:43.475+00', '2026-09-20 23:49:43', '91+87883766', 'Shravan b', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('f5cc3da7-361f-4bcf-8016-0b71b8967b1f', 'KOT-1442', 'completed', 1575.00, '[{"id": "f0f775b8-404c-40c6-87c1-2435430b03ae", "name": "Crunchy Royale Burger", "notes": "", "price": 250.0, "total": 500.0, "item_id": "c9c0651f-b2c8-4fcf-a792-3806cfbc575d", "quantity": 2, "kot_round": 1}, {"id": "3ac8fa73-67e1-4a07-b2f6-8e5ba00e3486", "name": "Grilled Chicken Burger", "notes": "", "price": 280.0, "total": 560.0, "item_id": "c7745ec2-4332-42e1-9688-d3abb6ee3b63", "quantity": 2, "kot_round": 1}, {"id": "e493c172-830a-4b2d-a05e-4cff80efe7ff", "name": "Veg Herb Delight Burger", "notes": "", "price": 220.0, "total": 440.0, "item_id": "6a005377-56f0-4926-8cb9-4a475045f20d", "quantity": 2, "kot_round": 2}]', 'Table 01', '2026-09-24 17:26:14.245+00', '24-Sep-2026 10:56 PM', '+91 9922441812', 'Shravan', NULL, 0, 'dine_in', 'KOT Round #2', NULL, NULL),
	('e9a09eec-c071-4b47-8b35-060a1773fb51', 'VY-ZOM-9821', 'completed', 462.00, '[{"id": "ITM-Z03", "isVeg": true, "price": 340, "addons": [], "category": "Burgers", "itemName": "Xtra Loaded Stack Burger", "quantity": 1, "itemTotal": 340, "specialNotes": ""}]', 'Opposite Community Clubhouse', '2026-08-19 18:13:08.391088+00', '19/8/2026, 11:43:07 pm', '+91 98450 11223', 'Vikramaditya Roy', NULL, 0, 'delivery', 'Address: Villa 14, Palm Meadows, Whitefield, Bengaluru (560066) | Payment: PREPAID', 'Pack extra salan & onion salad. Do not ring bell, infant sleeping.', 'ZOMATO'),
	('4c364c49-b513-4b00-a096-faec8036b670', 'VY-ZOM-9821', 'completed', 462.00, '[{"id": "ITM-01", "isVeg": false, "price": 340, "addons": [], "category": "Burgers", "itemName": "Xtra Loaded Stack Burger", "quantity": 1, "itemTotal": 340, "specialNotes": ""}]', 'Opposite Community Clubhouse', '2026-10-06 15:16:05.012101+00', '6/10/2026, 8:46:04 pm', '+91 99224 41812', 'Shravan', NULL, 0, 'delivery', 'Address: Villa 14, Palm Meadows, Whitefield, Bengaluru (560066) | Payment: PREPAID', 'Pack extra ketchup & napkins. Ring doorbell once.', 'ZOMATO'),
	('4ee1b7fb-1a52-4fa6-af2d-622201c6a466', 'VY-ZOM-261006-8668', 'completed', 462.00, '[{"id": "ITM-01", "isVeg": false, "price": 340, "addons": [], "category": "Burgers", "itemName": "Xtra Loaded Stack Burger", "quantity": 1, "itemTotal": 340, "specialNotes": ""}]', 'Opposite Community Clubhouse', '2026-10-06 15:35:26.91076+00', '6/10/2026, 9:05:25 pm', '+91 99224 41812', 'Shravan', NULL, 0, 'delivery', 'Address: Villa 14, Palm Meadows, Whitefield, Bengaluru (560066) | Payment: PREPAID', 'Pack extra ketchup & napkins. Ring doorbell once.', 'ZOMATO'),
	('61078869-7f4e-471f-83b7-dcc49c570411', '6646', 'completed', 1240.00, '[{"id": "faade783-ec12-418c-9226-ff63441569e8", "name": "Xtra Loaded Stack Burger", "price": 340, "quantity": 2}, {"id": "c7745ec2-4332-42e1-9688-d3abb6ee3b63", "name": "Grilled Chicken Burger", "price": 280, "quantity": 2}]', 'Table 01', '2026-09-04 17:04:40.997+00', '2026-09-04 22:34:40', '91+ 87883 76667', 'Shravan b', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('4d621ac7-d3e0-4aa2-90b3-2633e14c7e27', '2556', 'completed', 290.00, '[{"id": "2392fa5d-8de3-428d-a31f-1d82bec91fd1", "name": "Xtra Stack Burger", "price": 290, "quantity": 1}]', 'Table 01', '2026-09-20 18:20:27.662+00', '2026-09-20 23:50:27', '91+87883766', 'Shravan b', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('c194ed17-b783-42e2-85a6-dfe78657e3b0', '6414', 'completed', 1240.00, '[{"id": "faade783-ec12-418c-9226-ff63441569e8", "name": "Xtra Loaded Stack Burger", "price": 340, "quantity": 2}, {"id": "c7745ec2-4332-42e1-9688-d3abb6ee3b63", "name": "Grilled Chicken Burger", "price": 280, "quantity": 2}]', 'Table 01', '2026-09-04 17:05:25.983+00', '2026-09-04 22:35:25', '91+ 87883 76667', 'Shravan b', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('cfcdc441-984b-410f-b1bb-04139557e649', 'VY-SW-6428', 'completed', 462.00, '[{"id": "ITM-01", "isVeg": true, "price": 320, "addons": [], "category": "Main Course", "itemName": "Paneer Butter Masala", "quantity": 1, "itemTotal": 320, "specialNotes": ""}, {"id": "ITM-02", "isVeg": true, "price": 40, "addons": [], "category": "Breads", "itemName": "Butter Naan", "quantity": 3, "itemTotal": 120, "specialNotes": ""}]', 'Katraj', '2026-10-08 10:25:54.343373+00', '8/10/2026, 3:55:52 pm', '+91 99224 41812', 'Shravan Bhokase', NULL, 0, 'delivery', 'Address: Katraj, Pune, Pune (411046) | Payment: PREPAID', NULL, 'SWIGGY'),
	('b623555d-dc37-4a03-be9b-cf1f86a0562b', 'TOK-3012', 'waiting for payment', 0.00, '[]', NULL, '2026-10-07 17:14:32.193577+00', '7/10/2026, 10:44:32 pm', NULL, NULL, NULL, 0, 'dine_in', NULL, NULL, 'ZOMATO'),
	('46d5992b-16d2-4f83-89c2-e1430a36717b', 'VY-ZOM-9821', 'completed', 1667.00, '[{"id": "ITM-Z01", "isVeg": false, "price": 490, "addons": [{"id": "AD-01", "name": "Extra Mirchi Ka Salan", "price": 35}, {"id": "AD-02", "name": "Boiled Egg (2 pcs)", "price": 30}], "category": "Biryani", "itemName": "Hyderabadi Mutton Dum Biryani (Large)", "quantity": 2, "itemTotal": 1110, "specialNotes": "Extra spicy masala layer"}, {"id": "ITM-Z02", "isVeg": false, "price": 380, "addons": [], "category": "Starters", "itemName": "Galouti Kebab with Ulte Tawa Ka Paratha", "quantity": 1, "itemTotal": 380, "specialNotes": ""}, {"id": "ITM-Z03", "isVeg": true, "price": 140, "addons": [], "category": "Desserts", "itemName": "Gulab Jamun with Rabri (2 pcs)", "quantity": 1, "itemTotal": 140, "specialNotes": ""}]', 'Opposite Community Clubhouse', '2026-08-19 18:14:21.388228+00', '19/8/2026, 11:44:20 pm', '+91 98450 11223', 'Vikramaditya Roy', NULL, 150, 'delivery', 'Address: Villa 14, Palm Meadows, Whitefield, Bengaluru (560066) | Payment: PREPAID', 'Pack extra salan & onion salad. Do not ring bell, infant sleeping.', 'ZOMATO'),
	('20ec0278-d520-4ac5-b82c-5bc750f0a4ef', 'VY-ZOM-9821', 'completed', 462.00, '[{"id": "ITM-01", "isVeg": true, "price": 340, "addons": [], "category": "Burgers", "itemName": "Xtra Loaded Stack Burger", "quantity": 1, "itemTotal": 340, "specialNotes": ""}]', 'Opposite Community Clubhouse', '2026-09-25 07:21:31.949757+00', '25/9/2026, 12:51:28 pm', '+91 99224 41812', 'Shravan', NULL, 0, 'delivery', 'Address: Villa 14, Palm Meadows, Whitefield, Bengaluru (560066) | Payment: PREPAID', 'Pack extra ketchup & napkins. Ring doorbell once.', 'ZOMATO'),
	('e662fb4d-7cb4-43f4-bd00-e43361580996', 'VY-ZOM-9821', 'completed', 462.00, '[{"id": "ITM-01", "isVeg": true, "price": 340, "addons": [], "category": "Burgers", "itemName": "Xtra Loaded Stack Burger", "quantity": 1, "itemTotal": 340, "specialNotes": ""}]', 'Opposite Community Clubhouse', '2026-09-25 18:11:48.181716+00', '25/9/2026, 11:41:44 pm', '+91 87883 76667', 'Shravan', NULL, 0, 'delivery', 'Address: Villa 14, Palm Meadows, Whitefield, Bengaluru (560066) | Payment: PREPAID', 'Pack extra ketchup & napkins. Ring doorbell once.', 'ZOMATO'),
	('f5bd1ca4-2f62-4466-a9a5-0a46d9174b37', 'VY-ZOM-9821', 'completed', 462.00, '[{"id": "ITM-Z03", "isVeg": true, "price": 340, "addons": [], "category": "Burgers", "itemName": "Xtra Loaded Stack Burger", "quantity": 1, "itemTotal": 340, "specialNotes": ""}]', 'Opposite Community Clubhouse', '2026-08-19 18:35:59.183072+00', '20/8/2026, 12:05:58 am', '+91 98450 11223', 'Vikramaditya Roy', NULL, 0, 'delivery', 'Address: Villa 14, Palm Meadows, Whitefield, Bengaluru (560066) | Payment: PREPAID', 'Pack extra salan & onion salad. Do not ring bell, infant sleeping.', 'ZOMATO'),
	('5ddf9f1d-b8a2-4d16-888d-3360959cb556', 'TOK-6345', 'completed', 0.00, '[]', NULL, '2026-09-25 07:22:32.041572+00', '25/9/2026, 12:52:29 pm', NULL, NULL, NULL, 0, 'dine_in', NULL, NULL, 'ZOMATO'),
	('42ab7abe-0caf-4df1-81e1-fb9d72854e3e', 'VY-ZOM-9821', 'completed', 462.00, '[{"id": "ITM-01", "isVeg": false, "price": 340, "addons": [], "category": "Burgers", "itemName": "Xtra Loaded Stack Burger", "quantity": 1, "itemTotal": 340, "specialNotes": ""}]', 'Opposite Community Clubhouse', '2026-09-03 09:50:36.432912+00', '3/9/2026, 3:20:36 pm', '+91 99224 41812', 'Shravan', NULL, 0, 'delivery', 'Address: Villa 14, Palm Meadows, Whitefield, Bengaluru (560066) | Payment: PREPAID', 'Pack extra ketchup & napkins. Ring doorbell once.', 'ZOMATO'),
	('74b6c743-e06d-4e11-9c4a-1e9ac09986e8', 'KOT-2493', 'completed', 1113.00, '[{"id": "79c6e5f7-3ca1-4ed7-bc13-6a61c6fbaf98", "name": "Crunchy Royale Burger", "notes": "", "price": 250.0, "total": 500.0, "item_id": "c9c0651f-b2c8-4fcf-a792-3806cfbc575d", "quantity": 2, "kot_round": 1}, {"id": "7fdb7fc0-27be-4c3f-ae8c-3d6d47a99355", "name": "Grilled Chicken Burger", "notes": "", "price": 280.0, "total": 560.0, "item_id": "c7745ec2-4332-42e1-9688-d3abb6ee3b63", "quantity": 2, "kot_round": 2}]', 'Table 01', '2026-10-06 16:02:45.016+00', '06-Oct-2026 09:32 PM', '+91 9922441812', 'Shravan', NULL, 0, 'dine_in', 'KOT Round #2', NULL, NULL),
	('97a246ea-9934-4f11-9fcd-12e8b275a8b1', 'SW-9675', 'completed', 0.00, '[]', NULL, '2026-10-07 17:15:59.749301+00', '7/10/2026, 10:45:58 pm', NULL, NULL, NULL, 0, 'dine_in', NULL, NULL, 'Swiggy'),
	('f1155528-877c-4d94-ac11-693e29aee31d', 'VY-ZOM-260925-6131', 'completed', 462.00, '[{"id": "ITM-01", "isVeg": false, "price": 340, "addons": [], "category": "Burgers", "itemName": "Xtra Loaded Stack Burger", "quantity": 1, "itemTotal": 340, "specialNotes": ""}]', 'Opposite Community Clubhouse', '2026-09-27 07:37:43.204937+00', '27/9/2026, 1:07:42 pm', '+91 99224 41812', 'Shravan', NULL, 0, 'delivery', 'Address: Villa 14, Palm Meadows, Whitefield, Bengaluru (560066) | Payment: PREPAID', 'Pack extra ketchup & napkins. Ring doorbell once.', 'ZOMATO'),
	('ddae98f0-6a31-441a-9a22-67de9bd3c0ef', 'VY-SW-2144', 'waiting for payment', 462.00, '[{"id": "ITM-01", "isVeg": true, "price": 320, "addons": [], "category": "Main Course", "itemName": "Paneer Butter Masala", "quantity": 1, "itemTotal": 320, "specialNotes": ""}, {"id": "ITM-02", "isVeg": true, "price": 40, "addons": [], "category": "Breads", "itemName": "Butter Naan", "quantity": 3, "itemTotal": 120, "specialNotes": ""}]', 'Katraj', '2026-10-08 10:34:11.767549+00', '8/10/2026, 4:04:09 pm', '+91 99224 41812', 'Shravan Bhokase', NULL, 0, 'delivery', 'Address: Katraj, Pune, Pune (411046) | Payment: PREPAID', NULL, 'SWIGGY'),
	('264836de-2810-4531-9a7f-9841b8199130', '7948', 'completed', 680.00, '[{"id": "faade783-ec12-418c-9226-ff63441569e8", "name": "Xtra Loaded Stack Burger", "price": 340, "quantity": 2}]', 'Table 01', '2026-09-27 07:38:34.769+00', '2026-09-27 13:08:34', '91+87883766', 'Shravan b', NULL, NULL, 'dine_in', NULL, NULL, NULL),
	('e2e3de21-1594-4413-86fb-6753258b8eb0', 'VY-ZOM-9821', 'completed', 1667.00, '[{"id": "ITM-Z01", "isVeg": false, "price": 490, "addons": [{"id": "AD-01", "name": "Extra Mirchi Ka Salan", "price": 35}, {"id": "AD-02", "name": "Boiled Egg (2 pcs)", "price": 30}], "category": "Biryani", "itemName": "Hyderabadi Mutton Dum Biryani (Large)", "quantity": 2, "itemTotal": 1110, "specialNotes": "Extra spicy masala layer"}, {"id": "ITM-Z02", "isVeg": false, "price": 380, "addons": [], "category": "Starters", "itemName": "Galouti Kebab with Ulte Tawa Ka Paratha", "quantity": 1, "itemTotal": 380, "specialNotes": ""}, {"id": "ITM-Z03", "isVeg": true, "price": 140, "addons": [], "category": "Desserts", "itemName": "Gulab Jamun with Rabri (2 pcs)", "quantity": 1, "itemTotal": 140, "specialNotes": ""}]', 'Opposite Community Clubhouse', '2026-08-20 17:15:37.055031+00', '20/8/2026, 10:45:36 pm', '+91 98450 11223', 'Vikramaditya Roy', NULL, 150, 'delivery', 'Address: Villa 14, Palm Meadows, Whitefield, Bengaluru (560066) | Payment: PREPAID', 'Pack extra salan & onion salad. Do not ring bell, infant sleeping.', 'ZOMATO'),
	('00548d8c-1ea4-497c-ac95-3718bab17342', 'VY-ZOM-9821', 'completed', 462.00, '[{"id": "ITM-Z03", "isVeg": true, "price": 340, "addons": [], "category": "Burgers", "itemName": "Xtra Loaded Stack Burger", "quantity": 1, "itemTotal": 340, "specialNotes": ""}]', 'Opposite Community Clubhouse', '2026-08-20 19:56:01.885882+00', '21/8/2026, 1:26:01 am', '+91 98450 11223', 'Vikramaditya Roy', NULL, 0, 'delivery', 'Address: Villa 14, Palm Meadows, Whitefield, Bengaluru (560066) | Payment: PREPAID', 'Pack extra salan & onion salad. Do not ring bell, infant sleeping.', 'ZOMATO'),
	('0a5bf626-cec5-4421-9a17-083eb3f10ee6', 'KOT-4053', 'completed', 987.00, '[{"id": "08eb22d4-33b9-4db2-abc2-03982c690fc3", "name": "Crunchy Royale Burger", "notes": "", "price": 250.0, "total": 500.0, "item_id": "c9c0651f-b2c8-4fcf-a792-3806cfbc575d", "quantity": 2, "kot_round": 1}, {"id": "ef2257d7-17f6-44f1-a353-208c578ef609", "name": "Veg Herb Delight Burger", "notes": "", "price": 220.0, "total": 440.0, "item_id": "6a005377-56f0-4926-8cb9-4a475045f20d", "quantity": 2, "kot_round": 2}]', 'Table 01', '2026-10-06 16:28:51.053+00', '06-Oct-2026 09:58 PM', '+91 87883 76667', 'Shravan b', NULL, 0, 'dine_in', 'KOT Round #2', NULL, NULL),
	('4af02808-0b66-4f99-90e8-b22e84ecb09c', 'TOK-2842', 'waiting for payment', 0.00, '[]', NULL, '2026-10-07 17:16:02.78555+00', '7/10/2026, 10:46:00 pm', NULL, NULL, NULL, 0, 'dine_in', NULL, NULL, 'ZOMATO'),
	('fc141a11-6005-4fa1-9b75-9c3bf769eeb8', '5838', 'completed', 680.00, '[{"id": "faade783-ec12-418c-9226-ff63441569e8", "name": "Xtra Loaded Stack Burger", "price": 340, "quantity": 2}]', 'Table 01', '2026-10-05 10:39:15.141+00', '2026-10-05 16:09:15', '+918788376667', 'Shravan b', NULL, NULL, 'dine_in', NULL, NULL, NULL);


--
-- Data for Name: tables; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."tables" ("id", "table_number", "capacity", "status", "section", "customer_name", "active_order_id", "total_amount", "created_at", "updated_at") VALUES
	('t-13', 'Table 13', 4, 'available', 'Main Hall', NULL, '3d310dcb-2961-4c6d-9ac6-84c5c4f0ff14', 0.00, '2026-08-13 16:00:03.739246+00', '2026-09-02 03:24:51.102+00'),
	('t-16', 'Table 16', 4, 'available', 'Main Hall', NULL, NULL, 0.00, '2026-08-13 16:00:03.739246+00', '2026-09-02 03:24:51.102+00'),
	('t-17', 'Table 17', 4, 'available', 'Main Hall', NULL, NULL, 0.00, '2026-08-13 16:00:03.739246+00', '2026-09-02 03:24:51.102+00'),
	('t-1', 'Table 01', 4, 'available', 'Main Hall', NULL, 'f25df005-0c8c-457f-8edd-5e444e8237bf', 0.00, '2026-08-13 16:00:03.739246+00', '2026-10-06 16:58:16.414+00'),
	('t-18', 'Table 18', 4, 'available', 'Main Hall', NULL, NULL, 0.00, '2026-08-13 16:00:03.739246+00', '2026-09-02 03:24:51.102+00'),
	('t-10', 'Table 10', 4, 'available', 'Main Hall', NULL, NULL, 0.00, '2026-08-13 16:00:03.739246+00', '2026-09-17 17:36:24.646+00'),
	('t-15', 'Table 15', 4, 'available', 'Main Hall', NULL, 'eee208a9-a24e-452e-84c7-1e458be877b3', 0.00, '2026-08-13 16:00:03.739246+00', '2026-09-17 17:36:25.436+00'),
	('t-19', 'Table 19', 4, 'available', 'Main Hall', NULL, '5b9d8bd5-09ac-4d51-b6f3-9cb7adf6b645', 0.00, '2026-08-13 16:00:03.739246+00', '2026-09-02 03:24:51.102+00'),
	('t-14', 'Table 14', 4, 'available', 'Main Hall', NULL, NULL, 0.00, '2026-08-13 16:00:03.739246+00', '2026-09-17 17:36:26.379+00'),
	('t-12', 'Table 12', 4, 'available', 'Main Hall', NULL, NULL, 0.00, '2026-08-13 16:00:03.739246+00', '2026-09-17 17:36:42.634+00'),
	('t-20', 'Table 20', 4, 'available', 'Main Hall', NULL, NULL, 0.00, '2026-08-13 16:00:03.739246+00', '2026-09-02 03:24:51.102+00'),
	('t-2', 'Table 02', 4, 'available', 'Main Hall', NULL, '0b3c1425-8a4d-4443-b925-70af786e1fdc', 0.00, '2026-08-13 16:00:03.739246+00', '2026-09-20 04:27:08.373+00'),
	('t-3', 'Table 03', 4, 'available', 'Main Hall', NULL, NULL, 0.00, '2026-08-13 16:00:03.739246+00', '2026-09-02 03:24:51.102+00'),
	('t-4', 'Table 04', 4, 'available', 'Main Hall', NULL, '57954161-5155-4849-bc06-5397ee61ea3a', 0.00, '2026-08-13 16:00:03.739246+00', '2026-09-02 03:24:51.102+00'),
	('t-5', 'Table 05', 4, 'available', 'Main Hall', NULL, NULL, 0.00, '2026-08-13 16:00:03.739246+00', '2026-09-02 03:24:51.102+00'),
	('t-6', 'Table 06', 4, 'available', 'Main Hall', NULL, '4fe6035b-d4e7-43d2-87db-8ca4b2f2e638', 0.00, '2026-08-13 16:00:03.739246+00', '2026-09-02 03:24:51.102+00'),
	('t-7', 'Table 07', 4, 'available', 'Main Hall', NULL, NULL, 0.00, '2026-08-13 16:00:03.739246+00', '2026-09-02 03:24:51.102+00'),
	('t-8', 'Table 08', 4, 'available', 'Main Hall', NULL, '619a5850-40d7-47e9-9118-b50ee75f49dc', 0.00, '2026-08-13 16:00:03.739246+00', '2026-09-02 03:24:51.102+00'),
	('t-9', 'Table 09', 4, 'available', 'Main Hall', NULL, NULL, 0.00, '2026-08-13 16:00:03.739246+00', '2026-09-02 03:24:51.102+00'),
	('t-11', 'Table 11', 4, 'available', 'Main Hall', NULL, NULL, 0.00, '2026-08-13 16:00:03.739246+00', '2026-09-02 03:24:51.102+00');


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id", "type", "versioning_status", "lifecycle_configuration", "lifecycle_configuration_generation") VALUES
	('receipts', 'receipts', NULL, '2026-10-05 11:20:00.150014+00', '2026-10-05 11:20:00.150014+00', true, false, NULL, NULL, NULL, 'STANDARD', 'DISABLED', NULL, NULL);


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."objects" ("id", "bucket_id", "name", "owner", "created_at", "updated_at", "last_accessed_at", "metadata", "version", "owner_id", "user_metadata", "archived_at", "is_delete_marker", "is_versioned") VALUES
	('b69bcb2e-85a8-4377-8d68-1f00db16b79a', 'receipts', '1791221200622_dfqw15.pdf', NULL, '2026-10-05 17:26:42.025232+00', '2026-10-05 17:26:42.025232+00', '2026-10-05 17:26:42.025232+00', '{"eTag": "\"8fc6458a45ead0f35d3b536683900382\"", "size": 5825, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2026-10-05T17:26:42.000Z", "contentLength": 5825, "httpStatusCode": 200}', '976969c8-9662-40af-9b8e-34514c5a1f6a', NULL, '{}', NULL, false, false),
	('db2238af-6680-4f07-8618-9a253a602088', 'receipts', '1791222758094_ja7kxc.pdf', NULL, '2026-10-05 17:52:39.417043+00', '2026-10-05 17:52:39.417043+00', '2026-10-05 17:52:39.417043+00', '{"eTag": "\"8fc6458a45ead0f35d3b536683900382\"", "size": 5825, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2026-10-05T17:52:40.000Z", "contentLength": 5825, "httpStatusCode": 200}', '664fc221-5a81-43ea-b0a2-bcbb0b01bb23', NULL, '{}', NULL, false, false),
	('1376484d-fde5-4871-ad00-159e54c0a56a', 'receipts', '1791222973799_3dp28j.webp', NULL, '2026-10-05 17:56:15.536438+00', '2026-10-05 17:56:15.536438+00', '2026-10-05 17:56:15.536438+00', '{"eTag": "\"24c086b95deade52f9c982d9af837751\"", "size": 15258, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-10-05T17:56:16.000Z", "contentLength": 15258, "httpStatusCode": 200}', 'a612a357-397e-4167-bf0c-ff4b171558cb', NULL, '{}', NULL, false, false),
	('da21ab31-174e-4b96-85ba-1d4acd6b7fa8', 'receipts', '1791223442132_h8tmde.webp', NULL, '2026-10-05 18:04:03.326468+00', '2026-10-05 18:04:03.326468+00', '2026-10-05 18:04:03.326468+00', '{"eTag": "\"24c086b95deade52f9c982d9af837751\"", "size": 15258, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-10-05T18:04:04.000Z", "contentLength": 15258, "httpStatusCode": 200}', '621140cc-79c3-4a0a-9f17-98aee6725d91', NULL, '{}', NULL, false, false),
	('77e1fae5-2336-4b5f-b1a4-9b6c5e0b100e', 'receipts', '1791223544983_n72xk1.pdf', NULL, '2026-10-05 18:05:46.476005+00', '2026-10-05 18:05:46.476005+00', '2026-10-05 18:05:46.476005+00', '{"eTag": "\"8fc6458a45ead0f35d3b536683900382\"", "size": 5825, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2026-10-05T18:05:47.000Z", "contentLength": 5825, "httpStatusCode": 200}', '93fa4eb4-7a0e-439e-b9af-9eb35f410a60', NULL, '{}', NULL, false, false);


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: hooks; Type: TABLE DATA; Schema: supabase_functions; Owner: supabase_functions_admin
--

INSERT INTO "supabase_functions"."hooks" ("id", "hook_table_id", "hook_name", "created_at", "request_id") VALUES
	(1, 27606, 'sync-to-sheet', '2026-10-05 17:56:16.740531+00', 1),
	(2, 27606, 'sync-to-sheet', '2026-10-05 18:03:27.168424+00', 2),
	(3, 27606, 'sync-to-sheet', '2026-10-05 18:04:03.55171+00', 3),
	(4, 27606, 'sync-to-sheet', '2026-10-05 18:05:46.768664+00', 4);


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 1, false);


--
-- Name: hooks_id_seq; Type: SEQUENCE SET; Schema: supabase_functions; Owner: supabase_functions_admin
--

SELECT pg_catalog.setval('"supabase_functions"."hooks_id_seq"', 4, true);


--
-- PostgreSQL database dump complete
--

-- \unrestrict Fx0bvopbEi47bunJtEVeaTr3CbI6fNssdaN5cD91FQRa347CDZDLNE4xciU1VQE

RESET ALL;
