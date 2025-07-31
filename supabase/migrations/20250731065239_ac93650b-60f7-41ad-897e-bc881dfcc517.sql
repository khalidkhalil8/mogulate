-- Fix the remaining function security warning by updating the validation steps function

CREATE OR REPLACE FUNCTION public.update_validation_steps_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;