-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Clean up any existing objects (if needed)
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists handle_new_user();
drop policy if exists "Users can view their own profile" on users;
drop policy if exists "Users can update their own profile" on users;
drop policy if exists "Anyone can view schools" on schools;
drop policy if exists "Only admins can modify schools" on schools;

-- Create tables
create table if not exists public.schools (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    city text not null,
    state text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.users (
    id uuid primary key references auth.users(id) on delete cascade,
    email text not null unique,
    first_name text not null,
    last_name text,
    phone text,
    role text not null check (role in ('student', 'agent', 'admin')) default 'student',
    school_id uuid references public.schools(id),
    business_reg_number text unique check (
        role != 'agent' or 
        (business_reg_number ~ '^RC[0-9]{6,7}$')
    ),
    address text,
    profile_image_url text,
    face_photo_url text,
    verified_status boolean default false,
    terms_accepted boolean default false,
    terms_accepted_at timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint agent_required_fields check (
        role != 'agent' or 
        (
            business_reg_number is not null and
            last_name is not null and
            phone is not null and
            address is not null
        )
    )
);

create table if not exists public.hostels (
    id uuid default uuid_generate_v4() primary key,
    agent_id uuid not null references public.users(id) on delete cascade,
    name text not null,
    description text not null,
    address text not null,
    city text not null,
    state text not null,
    price_range_start numeric not null check (price_range_start >= 0),
    price_range_end numeric not null check (price_range_end >= price_range_start),
    school_id uuid references public.schools(id),
    approved boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint agent_must_be_verified check (
        exists (
            select 1 from users
            where users.id = agent_id
            and users.role = 'agent'
            and users.verified_status = true
        )
    )
);

create table if not exists public.hostel_media (
    id uuid default uuid_generate_v4() primary key,
    hostel_id uuid not null references public.hostels(id) on delete cascade,
    url text not null,
    type text not null check (type in ('image', 'video')),
    is_primary boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.bookings (
    id uuid default uuid_generate_v4() primary key,
    student_id uuid not null references public.users(id) on delete cascade,
    hostel_id uuid not null references public.hostels(id) on delete cascade,
    status text not null check (status in ('pending', 'approved', 'rejected', 'completed', 'cancelled')),
    inspection_date timestamp with time zone,
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint student_must_be_verified check (
        exists (
            select 1 from users
            where users.id = student_id
            and users.role = 'student'
            and users.verified_status = true
        )
    )
);

create table if not exists public.ratings (
    id uuid default uuid_generate_v4() primary key,
    student_id uuid not null references public.users(id) on delete cascade,
    agent_id uuid not null references public.users(id) on delete cascade,
    hostel_id uuid not null references public.hostels(id) on delete cascade,
    rating integer not null check (rating >= 1 and rating <= 5),
    review text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint one_rating_per_booking check (
        exists (
            select 1 from bookings
            where bookings.student_id = student_id
            and bookings.hostel_id = hostel_id
            and bookings.status = 'completed'
        )
    )
);

-- Create indexes
create index if not exists schools_name_idx on schools using gin (to_tsvector('english', name));
create index if not exists schools_city_idx on schools (city);
create index if not exists schools_state_idx on schools (state);

create index if not exists users_email_idx on users (email);
create index if not exists users_role_idx on users (role);
create index if not exists users_school_id_idx on users (school_id);
create index if not exists users_verified_status_idx on users (verified_status);

create index if not exists hostels_agent_id_idx on hostels (agent_id);
create index if not exists hostels_school_id_idx on hostels (school_id);
create index if not exists hostels_city_idx on hostels (city);
create index if not exists hostels_state_idx on hostels (state);
create index if not exists hostels_price_range_idx on hostels (price_range_start, price_range_end);
create index if not exists hostels_approved_idx on hostels (approved);
create index if not exists hostels_search_idx on hostels using gin (to_tsvector('english', name || ' ' || description || ' ' || address));

create index if not exists bookings_student_id_idx on bookings (student_id);
create index if not exists bookings_hostel_id_idx on bookings (hostel_id);
create index if not exists bookings_status_idx on bookings (status);
create index if not exists bookings_inspection_date_idx on bookings (inspection_date);

create index if not exists ratings_student_id_idx on ratings (student_id);
create index if not exists ratings_agent_id_idx on ratings (agent_id);
create index if not exists ratings_hostel_id_idx on ratings (hostel_id);
create index if not exists ratings_rating_idx on ratings (rating);

-- Create updated_at triggers
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger update_users_updated_at
    before update on users
    for each row
    execute procedure update_updated_at_column();

create trigger update_schools_updated_at
    before update on schools
    for each row
    execute procedure update_updated_at_column();

create trigger update_hostels_updated_at
    before update on hostels
    for each row
    execute procedure update_updated_at_column();

create trigger update_hostel_media_updated_at
    before update on hostel_media
    for each row
    execute procedure update_updated_at_column();

create trigger update_bookings_updated_at
    before update on bookings
    for each row
    execute procedure update_updated_at_column();

create trigger update_ratings_updated_at
    before update on ratings
    for each row
    execute procedure update_updated_at_column();

-- Handle new user registration
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
    insert into public.users (
        id,
        email,
        first_name,
        last_name,
        phone,
        role,
        school_id,
        business_reg_number,
        address,
        profile_image_url,
        face_photo_url,
        verified_status,
        terms_accepted,
        terms_accepted_at
    )
    values (
        new.id,
        new.email,
        new.raw_user_meta_data->>'first_name',
        new.raw_user_meta_data->>'last_name',
        new.raw_user_meta_data->>'phone',
        coalesce(new.raw_user_meta_data->>'role', 'student'),
        (new.raw_user_meta_data->>'school_id')::uuid,
        new.raw_user_meta_data->>'business_reg_number',
        new.raw_user_meta_data->>'address',
        new.raw_user_meta_data->>'profile_image_url',
        new.raw_user_meta_data->>'face_photo_url',
        coalesce((new.raw_user_meta_data->>'verified_status')::boolean, false),
        coalesce((new.raw_user_meta_data->>'terms_accepted')::boolean, false),
        (new.raw_user_meta_data->>'terms_accepted_at')::timestamp
    );
    return new;
end;
$$;

-- Create trigger for new user registration
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- Enable Row Level Security
alter table users enable row level security;
alter table schools enable row level security;
alter table hostels enable row level security;
alter table hostel_media enable row level security;
alter table bookings enable row level security;
alter table ratings enable row level security;

-- Create RLS policies
create policy "Users can view their own profile"
    on users for select
    using (auth.uid() = id);

create policy "Users can update their own profile"
    on users for update
    using (auth.uid() = id);

create policy "Anyone can view schools"
    on schools for select
    using (true);

create policy "Only admins can modify schools"
    on schools for all
    using (
        exists (
            select 1 from users
            where users.id = auth.uid()
            and users.role = 'admin'
        )
    );

create policy "Agents can create hostels"
    on hostels for insert
    with check (
        exists (
            select 1 from users
            where users.id = auth.uid()
            and users.role = 'agent'
            and users.verified_status = true
        )
    );

create policy "Agents can update their own hostels"
    on hostels for update
    using (agent_id = auth.uid());

create policy "Anyone can view approved hostels"
    on hostels for select
    using (approved = true);

create policy "Agents can view their own hostels"
    on hostels for select
    using (agent_id = auth.uid());

create policy "Only admins can approve hostels"
    on hostels for update
    using (
        exists (
            select 1 from users
            where users.id = auth.uid()
            and users.role = 'admin'
        )
    )
    with check (approved = true);

create policy "Media visible to all if hostel approved"
    on hostel_media for select
    using (
        exists (
            select 1 from hostels
            where hostels.id = hostel_id
            and hostels.approved = true
        )
    );

create policy "Agents can manage their hostel media"
    on hostel_media for all
    using (
        exists (
            select 1 from hostels
            where hostels.id = hostel_id
            and hostels.agent_id = auth.uid()
        )
    );

create policy "Students can create bookings"
    on bookings for insert
    with check (
        exists (
            select 1 from users
            where users.id = auth.uid()
            and users.role = 'student'
            and users.verified_status = true
        )
    );

create policy "Students can view their bookings"
    on bookings for select
    using (student_id = auth.uid());

create policy "Agents can view bookings for their hostels"
    on bookings for select
    using (
        exists (
            select 1 from hostels
            where hostels.id = hostel_id
            and hostels.agent_id = auth.uid()
        )
    );

create policy "Students can create ratings"
    on ratings for insert
    with check (student_id = auth.uid());

create policy "Anyone can view ratings"
    on ratings for select
    using (true);

-- Create function to calculate average rating
create or replace function get_agent_rating(agent_uuid uuid)
returns numeric as $$
    select coalesce(avg(rating)::numeric(3,2), 0)
    from ratings
    where agent_id = agent_uuid;
$$ language sql stable;
