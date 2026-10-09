


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."sync_customer_from_order"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    cleaned_phone TEXT;
    total_orders_count INTEGER;
    vip_threshold INTEGER := 3;     -- Orders required for auto-VIP
    default_vip_discount INTEGER := 10; -- VIP discount percentage
    is_vip BOOLEAN;
    calculated_discount INTEGER;
BEGIN
    -- Normalize and clean the phone number if present
    IF NEW.customer_phone IS NOT NULL AND TRIM(NEW.customer_phone) <> '' THEN
        cleaned_phone := TRIM(NEW.customer_phone);
        
        -- Calculate total non-cancelled orders for this phone number
        SELECT COUNT(*)::INTEGER
        INTO total_orders_count
        FROM public.orders
        WHERE TRIM(customer_phone) = cleaned_phone 
          AND status <> 'cancelled';

        -- Determine if customer meets automatic VIP threshold
        IF total_orders_count >= vip_threshold THEN
            is_vip := true;
            calculated_discount := default_vip_discount;
        ELSE
            is_vip := false;
            calculated_discount := NULL;
        END IF;

        -- Upsert customer profile
        INSERT INTO public.customers (
            phone, 
            name, 
            order_count, 
            loyal_vip, 
            discount, 
            created_at, 
            gstin
        )
        VALUES (
            cleaned_phone,
            COALESCE(NULLIF(TRIM(NEW.customer_name), ''), 'Guest'),
            total_orders_count,
            is_vip,
            calculated_discount,
            COALESCE(NEW.created_at, now()),
            NULLIF(TRIM(NEW.gstin), '')
        )
        ON CONFLICT (phone) DO UPDATE
        SET 
            -- Preserve real customer name if already set
            name = CASE 
                WHEN EXCLUDED.name IS NOT NULL AND EXCLUDED.name <> '' AND EXCLUDED.name <> 'Guest' THEN EXCLUDED.name 
                ELSE public.customers.name 
            END,
            order_count = GREATEST(public.customers.order_count, total_orders_count),
            -- Preserve manual VIP status if staff manually set it, or update if threshold hit
            loyal_vip = COALESCE(public.customers.loyal_vip, EXCLUDED.loyal_vip),
            discount = COALESCE(public.customers.discount, EXCLUDED.discount),
            gstin = COALESCE(NULLIF(TRIM(EXCLUDED.gstin), ''), public.customers.gstin);
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."sync_customer_from_order"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."app_passwords" (
    "key" "text" NOT NULL,
    "password" "text" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."app_passwords" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."customers" (
    "phone" "text" NOT NULL,
    "name" "text" NOT NULL,
    "order_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "gstin" "text",
    "loyal_vip" boolean DEFAULT false,
    "discount" bigint
);


ALTER TABLE "public"."customers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."expenses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "amount" numeric(10,2) NOT NULL,
    "category" "text" NOT NULL,
    "notes" "text",
    "receipt_url" "text" DEFAULT ''::"text" NOT NULL,
    CONSTRAINT "expenses_amount_check" CHECK (("amount" >= (0)::numeric))
);


ALTER TABLE "public"."expenses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."menu_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "price" numeric(10,2) NOT NULL,
    "category" "text" NOT NULL,
    "image" "text",
    "is_sold_out" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "discount_price" numeric
);


ALTER TABLE "public"."menu_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "token" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text",
    "total" numeric(10,2) NOT NULL,
    "items" "jsonb" NOT NULL,
    "table_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "placed_at_ist" "text",
    "customer_phone" "text",
    "customer_name" "text",
    "gstin" "text",
    "discount" bigint,
    "order_type" "text" DEFAULT 'dine_in'::"text",
    "notes" "text",
    "custom_instructions" "text",
    "aggregator_platform" "text",
    CONSTRAINT "orders_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'preparing'::"text", 'ready'::"text", 'waiting for payment'::"text", 'completed'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."orders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tables" (
    "id" "text" NOT NULL,
    "table_number" "text" NOT NULL,
    "capacity" integer DEFAULT 4 NOT NULL,
    "status" "text" DEFAULT 'available'::"text" NOT NULL,
    "section" "text" DEFAULT 'Main Hall'::"text",
    "customer_name" "text",
    "active_order_id" "text",
    "total_amount" numeric(10,2) DEFAULT 0.00,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "tables_status_check" CHECK (("status" = ANY (ARRAY['available'::"text", 'occupied'::"text", 'reserved'::"text", 'cleaning'::"text"])))
);


ALTER TABLE "public"."tables" OWNER TO "postgres";


ALTER TABLE ONLY "public"."app_passwords"
    ADD CONSTRAINT "app_passwords_pkey" PRIMARY KEY ("key");



ALTER TABLE ONLY "public"."customers"
    ADD CONSTRAINT "customers_pkey" PRIMARY KEY ("phone");



ALTER TABLE ONLY "public"."expenses"
    ADD CONSTRAINT "expenses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."menu_items"
    ADD CONSTRAINT "menu_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tables"
    ADD CONSTRAINT "tables_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tables"
    ADD CONSTRAINT "tables_table_number_key" UNIQUE ("table_number");



CREATE INDEX "idx_customers_name" ON "public"."customers" USING "btree" ("lower"("name"));



CREATE INDEX "idx_expenses_category" ON "public"."expenses" USING "btree" ("category");



CREATE INDEX "idx_expenses_created_at_desc" ON "public"."expenses" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_menu_items_category" ON "public"."menu_items" USING "btree" ("category");



CREATE INDEX "idx_orders_created_at" ON "public"."orders" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_orders_created_at_desc" ON "public"."orders" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_orders_customer_phone" ON "public"."orders" USING "btree" ("customer_phone") WHERE ("customer_phone" IS NOT NULL);



CREATE INDEX "idx_orders_status" ON "public"."orders" USING "btree" ("status");



CREATE INDEX "idx_orders_table_id" ON "public"."orders" USING "btree" ("table_id");



CREATE INDEX "idx_orders_token" ON "public"."orders" USING "btree" ("token");



CREATE INDEX "idx_tables_number" ON "public"."tables" USING "btree" ("table_number");



CREATE INDEX "idx_tables_status" ON "public"."tables" USING "btree" ("status");



CREATE OR REPLACE TRIGGER "sync-to-sheet" AFTER INSERT ON "public"."expenses" FOR EACH ROW EXECUTE FUNCTION "supabase_functions"."http_request"('https://orashnrwlkdsgkfmmwtw.supabase.co/functions/v1/sync-expense-to-sheets', 'POST', '{"Content-type":"application/json"}', '{}', '5000');



CREATE OR REPLACE TRIGGER "trg_sync_customer_from_order" AFTER INSERT OR UPDATE OF "status", "customer_phone" ON "public"."orders" FOR EACH ROW EXECUTE FUNCTION "public"."sync_customer_from_order"();



CREATE POLICY "Allow public delete access to expenses" ON "public"."expenses" FOR DELETE USING (true);



CREATE POLICY "Allow public insert to expenses" ON "public"."expenses" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow public insert to orders" ON "public"."orders" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow public read access to expenses" ON "public"."expenses" FOR SELECT USING (true);



CREATE POLICY "Allow public read and insert access to orders" ON "public"."orders" FOR SELECT USING (true);



CREATE POLICY "Allow public read and write access to customers" ON "public"."customers" USING (true) WITH CHECK (true);



CREATE POLICY "Allow public read on orders" ON "public"."orders" FOR SELECT USING (true);



CREATE POLICY "Allow public read on tables" ON "public"."tables" FOR SELECT USING (true);



CREATE POLICY "Allow public read-only access to menu items" ON "public"."menu_items" FOR SELECT USING (true);



CREATE POLICY "Allow public update access to expenses" ON "public"."expenses" FOR UPDATE USING (true) WITH CHECK (true);



CREATE POLICY "Allow public write on orders" ON "public"."orders" USING (true);



CREATE POLICY "Allow public write on tables" ON "public"."tables" USING (true);



CREATE POLICY "Allow service role full access on app_passwords" ON "public"."app_passwords" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Allow staff update access to orders" ON "public"."orders" FOR UPDATE USING (true) WITH CHECK (true);



CREATE POLICY "Allow staff write access to menu items" ON "public"."menu_items" USING (true) WITH CHECK (true);



CREATE POLICY "Deny public access on app_passwords" ON "public"."app_passwords" TO "authenticated", "anon" USING (false);



ALTER TABLE "public"."customers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."expenses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."menu_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tables" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."customers";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."menu_items";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."orders";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."tables";






GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






















































































































































GRANT ALL ON FUNCTION "public"."sync_customer_from_order"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_customer_from_order"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_customer_from_order"() TO "service_role";


















GRANT ALL ON TABLE "public"."app_passwords" TO "anon";
GRANT ALL ON TABLE "public"."app_passwords" TO "authenticated";
GRANT ALL ON TABLE "public"."app_passwords" TO "service_role";



GRANT ALL ON TABLE "public"."customers" TO "anon";
GRANT ALL ON TABLE "public"."customers" TO "authenticated";
GRANT ALL ON TABLE "public"."customers" TO "service_role";



GRANT ALL ON TABLE "public"."expenses" TO "anon";
GRANT ALL ON TABLE "public"."expenses" TO "authenticated";
GRANT ALL ON TABLE "public"."expenses" TO "service_role";



GRANT ALL ON TABLE "public"."menu_items" TO "anon";
GRANT ALL ON TABLE "public"."menu_items" TO "authenticated";
GRANT ALL ON TABLE "public"."menu_items" TO "service_role";



GRANT ALL ON TABLE "public"."orders" TO "anon";
GRANT ALL ON TABLE "public"."orders" TO "authenticated";
GRANT ALL ON TABLE "public"."orders" TO "service_role";



GRANT ALL ON TABLE "public"."tables" TO "anon";
GRANT ALL ON TABLE "public"."tables" TO "authenticated";
GRANT ALL ON TABLE "public"."tables" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































