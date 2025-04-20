
CREATE OR REPLACE FUNCTION public.book_ad_slot(
  p_slot_id UUID,
  p_advertiser_id UUID,
  p_ad_id UUID,
  p_ad_title TEXT,
  p_ad_description TEXT
) RETURNS public.bookings
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_slot public.ad_slots;
  v_booking public.bookings;
BEGIN
  -- Get the slot and lock it
  SELECT * INTO v_slot
  FROM public.ad_slots
  WHERE id = p_slot_id
  FOR UPDATE;
  
  -- Check if slot exists and is available
  IF v_slot IS NULL THEN
    RAISE EXCEPTION 'Ad slot not found';
  END IF;
  
  IF v_slot.status != 'available' THEN
    RAISE EXCEPTION 'Ad slot is not available';
  END IF;
  
  -- Update slot status
  UPDATE public.ad_slots
  SET status = 'booked'
  WHERE id = p_slot_id;
  
  -- Create booking
  INSERT INTO public.bookings (
    slot_id,
    advertiser_id,
    ad_id,
    ad_title,
    ad_description,
    status
  ) VALUES (
    p_slot_id,
    p_advertiser_id,
    p_ad_id,
    p_ad_title,
    p_ad_description,
    'pending'
  )
  RETURNING * INTO v_booking;
  
  -- Create notification for admin
  INSERT INTO public.notifications (
    user_id,
    title,
    message,
    type,
    target_id
  )
  SELECT
    u.id,
    'New Booking Request',
    format('New booking request for %s', v_slot.title),
    'booking_request',
    v_booking.id
  FROM public.profiles u
  WHERE u.role = 'admin'
  LIMIT 1;
  
  RETURN v_booking;
END;
$$;
