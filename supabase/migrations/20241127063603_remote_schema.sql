create type "public"."notification_type" as enum ('info', 'success', 'warning', 'error', 'crypto', 'wallet');

create sequence "public"."notifications_id_seq";

drop trigger if exists "tr_file_version" on "public"."file_uploads";

drop policy "Users can delete their own files" on "public"."file_uploads";

drop policy "Users can insert their own files" on "public"."file_uploads";

drop policy "Users can view their own files" on "public"."file_uploads";

drop policy "Users can delete their own tasks" on "public"."tasks";

drop policy "Users can insert their own tasks" on "public"."tasks";

drop policy "Users can update their own tasks" on "public"."tasks";

drop policy "Users can view their own tasks" on "public"."tasks";

revoke select on table "public"."file_uploads" from "PUBLIC";

revoke delete on table "public"."tasks" from "anon";

revoke insert on table "public"."tasks" from "anon";

revoke references on table "public"."tasks" from "anon";

revoke select on table "public"."tasks" from "anon";

revoke trigger on table "public"."tasks" from "anon";

revoke truncate on table "public"."tasks" from "anon";

revoke update on table "public"."tasks" from "anon";

revoke delete on table "public"."tasks" from "authenticated";

revoke insert on table "public"."tasks" from "authenticated";

revoke references on table "public"."tasks" from "authenticated";

revoke select on table "public"."tasks" from "authenticated";

revoke trigger on table "public"."tasks" from "authenticated";

revoke truncate on table "public"."tasks" from "authenticated";

revoke update on table "public"."tasks" from "authenticated";

revoke delete on table "public"."tasks" from "service_role";

revoke insert on table "public"."tasks" from "service_role";

revoke references on table "public"."tasks" from "service_role";

revoke select on table "public"."tasks" from "service_role";

revoke trigger on table "public"."tasks" from "service_role";

revoke truncate on table "public"."tasks" from "service_role";

revoke update on table "public"."tasks" from "service_role";

alter table "public"."file_uploads" drop constraint "file_uploads_unique_per_chat";

alter table "public"."file_uploads" drop constraint "file_uploads_unique_version";

alter table "public"."file_uploads" drop constraint "file_uploads_user_id_fkey";

alter table "public"."tasks" drop constraint "progress_range";

alter table "public"."tasks" drop constraint "tasks_status_check";

alter table "public"."tasks" drop constraint "tasks_type_check";

alter table "public"."tasks" drop constraint "tasks_user_id_fkey";

alter table "public"."tasks" drop constraint "tasks_pkey";

drop index if exists "public"."file_uploads_bucket_path_idx";

drop index if exists "public"."file_uploads_chat_id_idx";

drop index if exists "public"."file_uploads_created_at_idx";

drop index if exists "public"."file_uploads_unique_per_chat";

drop index if exists "public"."file_uploads_unique_version";

drop index if exists "public"."file_uploads_user_id_idx";

drop index if exists "public"."tasks_created_at_idx";

drop index if exists "public"."tasks_pkey";

drop index if exists "public"."tasks_status_idx";

drop index if exists "public"."tasks_type_idx";

drop index if exists "public"."tasks_user_id_idx";

drop table "public"."tasks";

create table "public"."notifications" (
    "id" bigint not null default nextval('notifications_id_seq'::regclass),
    "user_id" uuid not null,
    "content" text not null,
    "type" notification_type not null default 'info'::notification_type,
    "is_read" boolean not null default false,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."notifications" enable row level security;

create table "public"."profiles" (
    "id" uuid not null,
    "email" text,
    "full_name" text,
    "avatar_url" text,
    "provider" text,
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "created_at" timestamp with time zone not null default timezone('utc'::text, now())
);


alter table "public"."profiles" enable row level security;

alter table "public"."file_uploads" alter column "id" drop default;

alter table "public"."file_uploads" alter column "id" add generated always as identity;

alter table "public"."file_uploads" alter column "id" set data type bigint using "id"::bigint;

alter table "public"."file_uploads" disable row level security;

alter table "public"."users" add column "last_sign_in" timestamp with time zone;

alter table "public"."users" add column "nonce" text;

alter table "public"."users" add column "wallet_address" text;

alter sequence "public"."notifications_id_seq" owned by "public"."notifications"."id";

CREATE INDEX idx_users_wallet_address ON public.users USING btree (wallet_address);

CREATE UNIQUE INDEX notifications_pkey ON public.notifications USING btree (id);

CREATE INDEX profiles_email_idx ON public.profiles USING btree (email);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE INDEX profiles_provider_idx ON public.profiles USING btree (provider);

CREATE UNIQUE INDEX users_wallet_address_key ON public.users USING btree (wallet_address);

alter table "public"."notifications" add constraint "notifications_pkey" PRIMARY KEY using index "notifications_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."notifications" add constraint "notifications_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."notifications" validate constraint "notifications_user_id_fkey";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

alter table "public"."profiles" add constraint "profiles_user_id_fkey" FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_user_id_fkey";

alter table "public"."users" add constraint "users_wallet_address_key" UNIQUE using index "users_wallet_address_key";

grant delete on table "public"."notifications" to "anon";

grant insert on table "public"."notifications" to "anon";

grant references on table "public"."notifications" to "anon";

grant select on table "public"."notifications" to "anon";

grant trigger on table "public"."notifications" to "anon";

grant truncate on table "public"."notifications" to "anon";

grant update on table "public"."notifications" to "anon";

grant delete on table "public"."notifications" to "authenticated";

grant insert on table "public"."notifications" to "authenticated";

grant references on table "public"."notifications" to "authenticated";

grant select on table "public"."notifications" to "authenticated";

grant trigger on table "public"."notifications" to "authenticated";

grant truncate on table "public"."notifications" to "authenticated";

grant update on table "public"."notifications" to "authenticated";

grant delete on table "public"."notifications" to "service_role";

grant insert on table "public"."notifications" to "service_role";

grant references on table "public"."notifications" to "service_role";

grant select on table "public"."notifications" to "service_role";

grant trigger on table "public"."notifications" to "service_role";

grant truncate on table "public"."notifications" to "service_role";

grant update on table "public"."notifications" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

create policy "Users can insert their own notifications"
on "public"."notifications"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can update their own notifications"
on "public"."notifications"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Users can view their own notifications"
on "public"."notifications"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Create profile on signup"
on "public"."profiles"
as permissive
for insert
to public
with check ((auth.uid() = id));


create policy "Users can update own profile"
on "public"."profiles"
as permissive
for update
to public
using ((auth.uid() = id));


create policy "Users can view own profile"
on "public"."profiles"
as permissive
for select
to public
using ((auth.uid() = id));


create policy "Users can update own data"
on "public"."users"
as permissive
for update
to public
using (((auth.uid() = id) OR (wallet_address = ((current_setting('request.jwt.claims'::text))::json ->> 'wallet_address'::text))));


create policy "Users can view own data"
on "public"."users"
as permissive
for select
to public
using (((auth.uid() = id) OR (wallet_address = ((current_setting('request.jwt.claims'::text))::json ->> 'wallet_address'::text))));



