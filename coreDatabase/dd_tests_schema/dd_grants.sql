/* Grant access to dd and dd_non_ebr objects */
connect dd/dd
grant execute on dd.dd_admin_pkg to dd_tests;
grant all on dd.dd_members to dd_tests;
grant all on dd.dd_settings to dd_tests;
