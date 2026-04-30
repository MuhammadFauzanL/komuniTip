import { Body, Controller, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { OverlayService } from './overlay.service';
import { UpdateOverlaySettingsDto } from './dto/update-overlay-settings.dto';

@ApiTags('Overlay')
@Controller('overlay')
export class OverlayController {
  constructor(private readonly overlayService: OverlayService) {}

  @Get('settings')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mengambil konfigurasi overlay milik kreator yang sedang login' })
  async getMySettings(@Request() req) {
    return this.overlayService.getMyOverlaySettings(req.user.id);
  }

  @Patch('settings')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Memperbarui konfigurasi overlay milik kreator' })
  async updateMySettings(@Request() req, @Body() dto: UpdateOverlaySettingsDto) {
    return this.overlayService.updateMyOverlaySettings(req.user.id, dto);
  }

  @Post('test-alert')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mengirim test alert ke room overlay kreator yang sedang login' })
  async sendTestAlert(@Request() req) {
    return this.overlayService.emitTestAlert(req.user.id);
  }

  @Get('public/:username')
  @SkipThrottle()
  @ApiOperation({ summary: 'Mengambil konfigurasi overlay publik untuk renderer OBS' })
  @ApiParam({ name: 'username', example: 'rhrdiannz' })
  async getPublicSettings(@Param('username') username: string) {
    return this.overlayService.getPublicOverlaySettings(username);
  }
}
