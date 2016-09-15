BEGIN
   ctx_ddl.create_preference (preference_name   => 'dino_ds',
                              object_name       => 'user_datastore');
   ctx_ddl.set_attribute (
      preference_name   => 'dino_ds',
      attribute_name    => 'procedure',
      attribute_value   => USER || '.dd_text_uds_pkg.get_member_xml');
END;
/

SHOW ERROR

BEGIN
   ctx_ddl.create_section_group (group_name   => 'dino_sg',
                                 group_type   => 'XML_SECTION_GROUP');
   ctx_ddl.add_field_section ('dino_sg',
                              'MEMBER_ID',
                              'MEMBER_ID',
                              TRUE);
   ctx_ddl.add_field_section ('dino_sg',
                              'DINO_NAME',
                              'DINO_NAME',
                              TRUE);
   ctx_ddl.add_field_section ('dino_sg',
                              'ABOUT_YOURSELF',
                              'ABOUT_YOURSELF',
                              TRUE);
   ctx_ddl.add_field_section ('dino_sg',
                              'LOCATION_NAME',
                              'LOCATION_NAME',
                              TRUE);
   ctx_ddl.add_field_section ('dino_sg',
                              'ADDRESS',
                              'ADDRESS',
                              TRUE);
   ctx_ddl.add_field_section ('dino_sg',
                              'CITY',
                              'CITY',
                              TRUE);
   ctx_ddl.add_field_section ('dino_sg',
                              'STATE',
                              'STATE',
                              TRUE);
   ctx_ddl.add_field_section ('dino_sg',
                              'POSTAL_CODE',
                              'POSTAL_CODE',
                              TRUE);
   ctx_ddl.add_field_section ('dino_sg',
                              'COUNTRY',
                              'COUNTRY',
                              TRUE);
   ctx_ddl.add_field_section ('dino_sg',
                              'SPECIES_NAME',
                              'SPECIES_NAME',
                              TRUE);
   /*
    * Perform strutured search on AVGLEN and AVGHEIGHT with Oracle TEXT
    */
   ctx_ddl.add_sdata_section ('dino_sg',
                              'AVGLEN',
                              'AVGLEN',
                              'NUMBER');
   ctx_ddl.add_sdata_section ('dino_sg',
                              'AVGWEIGHT',
                              'AVGWEIGHT',
                              'NUMBER');
END;
/

SHOW ERROR

BEGIN
   ctx_ddl.create_preference ('dino_lx', 'BASIC_LEXER');
   ctx_ddl.set_attribute ('dino_lx', 'MIXED_CASE', 'NO');
   ctx_ddl.set_attribute ('dino_lx', 'BASE_LETTER', 'YES');
   ctx_ddl.set_attribute ('dino_lx', 'BASE_LETTER_TYPE', 'GENERIC');
END;
/

SHOW ERROR

CREATE INDEX dd_ft_members
   ON dd_members_t (about_yourself)
   INDEXTYPE IS ctxsys.context
      PARAMETERS ('
  datastore      dino_ds
  section group  dino_sg
  lexer          dino_lx
  stoplist       ctxsys.empty_stoplist
  memory 500M
  sync (ON COMMIT)
')
/