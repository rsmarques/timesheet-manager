<?php

use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Log;

class TimeManagerTest extends TestCase
{
    use WithoutMiddleware;

    public $prefix          = 'api';
    public $userParams      = ['email' => 'test@testcase.com', 'first_name' => 'Test', 'last_name' => 'Case', 'password' => '123456'];
    public $worksheetParams = ['hours' => 5, 'date' => '2016-10-19'];

    /**
     * A basic functional test example.
     *
     * @return void
     */
    public function testBasicExample()
    {

        $signUpData     = $this->call('POST', "{$this->prefix}/users/signup", $this->userParams);
        $this->see('token');

        $accessToken    = json_decode($signUpData->content(), true);

        $signInData     = $this->call('POST', "{$this->prefix}/users/signin", $this->userParams);
        $this->see(json_encode($accessToken, true));

        $meData         = $this->call('GET', "{$this->prefix}/me", $accessToken);
        $this->see('id');

    }
}
