/*-------------------------------------------------------------------------------
 *
 * Set up Oracle Text indexes
 */

CREATE OR REPLACE PACKAGE dd_text_uds_pkg
IS
   CURSOR dino_member_cur (dd_member_rid ROWID)
   IS
      SELECT dm.member_id,
             dm.dino_name,
             dm.about_yourself,
             dl.location_name,
             dl.address1 || ' ' || dl.address2 AS address,
             dl.city,
             dl.state,
             dl.postal_code,
             dl.country,
             ds.species_name,
             ds.average_length_in_feet,
             ds.average_weight_in_tons
        FROM dd_members dm
             JOIN dd_locations dl ON (dl.location_id = dm.location_id)
             JOIN dd_dinosaurs ds ON (ds.dinosaur_id = dm.dinosaur_id)
       WHERE dm.ROWID = dd_member_rid;

   PROCEDURE get_member_xml (rid IN ROWID, tlob IN OUT NOCOPY VARCHAR2);
END dd_text_uds_pkg;
/