CREATE OR REPLACE PACKAGE BODY dd_search_pkg
AS
   /*
    * Search for dates using Oracle Text
    */
   FUNCTION text_only (member_id_p IN INTEGER, search_string IN VARCHAR2)
      RETURN SearchTypeSet
      PIPELINED
   IS
      retSet   SearchType;
   BEGIN
      FOR members
         IN (SELECT member_id, dino_name
               FROM dd_members
              WHERE     contains (about_yourself, search_string) > 0
                    AND member_id != member_id_p)
      LOOP
         retSet.dino_name := members.dino_name;
         retSet.member_id := members.member_id;
         PIPE ROW (retSet);
      END LOOP;

      RETURN;
   END;

   /*
    * Search for dates using Oracle Text and Oracle Spatial
    */
   FUNCTION text_and_spatial (member_id_p     IN INTEGER,
                              search_string   IN VARCHAR2,
                              max_distance    IN INTEGER)
      RETURN SearchTypeSet
      PIPELINED
   IS
      retSet   SearchType;
   BEGIN
      FOR members
         IN (SELECT dm.member_id, dm.dino_name
               FROM dd_members dm,
                    dd_locations dl,
                    (SELECT geometry
                       FROM dd_members this_m, dd_locations this_l
                      WHERE     this_m.location_id = this_l.location_id
                            AND this_m.member_id =
                                   text_and_spatial.member_id_p)
                    member_location
              WHERE     dm.location_id = dl.location_id
                    AND contains (about_yourself, search_string) > 0
                    AND sdo_within_distance (
                           dl.geometry,
                           member_location.geometry,
                           'distance=' || max_distance || ' unit=km') =
                           'TRUE'
                    AND dm.member_id != text_and_spatial.member_id_p)
      LOOP
         retSet.dino_name := members.dino_name;
         retSet.member_id := members.member_id;
         PIPE ROW (retSet);
      END LOOP;

      RETURN;
   END;
END dd_search_pkg;
/