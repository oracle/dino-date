create or replace package body test_admin_generate_members as

  procedure set_max_members (
    members in int
  )
    is
  begin
    update dd.dd_settings
      set
        num_value = members
    where setting_name = 'max_members';

    commit;
    dd.dd_admin_pkg.load_settings;
  end set_max_members;

  procedure before_all
    is
  begin
    delete_added_members;
    set_max_members(60);
  end;

  procedure after_all
    is
  begin
    delete_added_members;
    set_max_members(10000);
  end;

  procedure delete_added_members
    is
  begin
    delete from dd.dd_members
    where member_id > 40;

    commit;
  end;

  procedure generate_ten
    is
  begin
    ut.expect(dd.dd_admin_pkg.generate_members(10) ).to_equal(10);
  end;

  procedure generate_over_limit
    is
  begin
    ut.expect(dd.dd_admin_pkg.generate_members(10000) ).to_equal(19);
  end generate_over_limit;

  procedure generate_zero
    is
  begin
    set_max_members(10);

    ut.expect(dd.dd_admin_pkg.generate_members(10000) ).to_equal(0);

    set_max_members(60);
  end generate_zero;

end test_admin_generate_members;
/
