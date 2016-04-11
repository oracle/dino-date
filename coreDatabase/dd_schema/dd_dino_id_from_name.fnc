CREATE OR REPLACE FUNCTION dd_dino_id_from_name (
      dino_name_in IN dd_dinosaurs.species_name%TYPE)
   RETURN dd_dinosaurs.dinosaur_id%TYPE
   RESULT_CACHE
IS
   /* 2016-03 SF Added result cache */

   l_id   dd_dinosaurs.dinosaur_id%TYPE;
BEGIN
   SELECT dinosaur_id
     INTO l_id
     FROM dd_dinosaurs
    WHERE species_name = dino_name_in;

   RETURN l_id;
EXCEPTION
   WHEN NO_DATA_FOUND
   THEN
      RETURN NULL;
END;
/