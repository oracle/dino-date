CREATE OR REPLACE PACKAGE BODY dd_text_uds_pkg
IS
   PROCEDURE get_member_xml (rid IN ROWID, tlob IN OUT NOCOPY VARCHAR2)
   IS
      l_row   dino_member_cur%ROWTYPE;
   BEGIN
      IF dino_member_cur%ISOPEN
      THEN
         CLOSE dino_member_cur;
      END IF;

      OPEN dino_member_cur (rid);

      FETCH dino_member_cur INTO l_row;

      tlob :=
            '<MEMBER_ID>'
         || l_row.member_id
         || '</MEMBER_ID>'
         || '<DINO_NAME>'
         || l_row.dino_name
         || '</DINO_NAME>'
         || '<ABOUT_YOURSELF>'
         || l_row.about_yourself
         || '</ABOUT_YOURSELF>'
         || '<LOCATION_NAME>'
         || l_row.location_name
         || '</LOCATION_NAME>'
         || '<ADDRESS>'
         || l_row.address
         || '</ADDRESS>'
         || '<CITY>'
         || l_row.city
         || '</CITY>'
         || '<STATE>'
         || l_row.state
         || '</STATE>'
         || '<POSTAL_CODE>'
         || l_row.postal_code
         || '</POSTAL_CODE>'
         || '<COUNTRY>'
         || l_row.country
         || '</COUNTRY>'
         || '<SPECIES_NAME>'
         || l_row.species_name
         || '</SPECIES_NAME>'
         || '<AVGLEN>'
         || l_row.average_length_in_feet
         || '</AVGLEN>'
         || '<AVGWEIGHT>'
         || l_row.average_weight_in_tons
         || '</AVGWEIGHT>';

      CLOSE dino_member_cur;
   END;
END dd_text_uds_pkg;
/